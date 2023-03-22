import dayjs from "dayjs";
import { LogParser } from "./parser";
import { v4 as uuidv4 } from "uuid";
import type { MeterData } from "meter-core/dist/data";

import fs from "fs";
import path from "path";

import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
type Encounter = {
  encounterId: string;
  encounterFile: string;
  duration: number;
  mostDamageTakenEntity: {
    name: string;
    damageTaken: number;
    isPlayer: boolean;
  };
};
export type FileWorkerOptions = {
  filename: string;
  splitOnPhaseTransition: boolean;
  mainFolder: string;
  parsedLogFolder: string;
  meterData: MeterData;
};

export function fileParserWorker(options: FileWorkerOptions, callback: CallableFunction) {
  try {
    const filenameSlice = options.filename.slice(0, -4);
    const jsonName = filenameSlice + ".json";

    const contents = fs.readFileSync(path.join(options.mainFolder, options.filename), "utf-8");
    if (!contents) return callback(null, "empty log");

    const logParser = new LogParser(options.meterData, false);
    if (options.splitOnPhaseTransition === true) logParser.splitOnPhaseTransition = true;

    const lines = contents.split("\n").filter((x) => x != null && x != "");
    for (const line of lines) {
      logParser.parseLogLine(line);
    }
    logParser.splitEncounter();

    const encounters = logParser.encounters;

    if (encounters.length > 0) {
      const masterLog: { encounters: Encounter[] } = { encounters: [] };

      for (const encounter of encounters) {
        const duration = encounter.lastCombatPacket - encounter.fightStartedOn;

        if (duration <= 1000) continue;

        let mostDamageTakenEntity = {
          name: "",
          damageTaken: 0,
          isPlayer: false,
        };

        encounter.entities.forEach((i) => {
          if (i.damageTaken > mostDamageTakenEntity.damageTaken) {
            mostDamageTakenEntity = {
              name: i.name,
              damageTaken: i.damageTaken,
              isPlayer: i.isPlayer,
            };
          }
        });

        const encounterDetails = {
          duration,
          mostDamageTakenEntity,
        };

        const encounterId = uuidv4();
        const encounterFile = `${filenameSlice}_${encounterId}_encounter.json`;
        masterLog.encounters.push({
          encounterId,
          encounterFile,
          ...encounterDetails,
        });

        fs.writeFileSync(
          path.join(options.parsedLogFolder, encounterFile),
          JSON.stringify(
            {
              ...encounter,
              ...encounterDetails,
            },
            replacer
          )
        );
      }

      fs.writeFileSync(path.join(options.parsedLogFolder, jsonName), JSON.stringify(masterLog));

      return callback(null, "log parsed");
    }

    return callback(null, "no encounters found");
  } catch (e) {
    return callback(e, "log parser error");
  }

  function replacer(_key: any, value: any) {
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries()),
      };
    } else if (value instanceof Set) {
      return {
        dataType: "Set",
        value: Array.from(value.values()),
      };
    } else {
      return value;
    }
  }
}
