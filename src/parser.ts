import { cloneDeep } from "lodash";
import { EventEmitter } from "events";
import type { MeterData, Skill, SkillBuff } from "meter-core/data";
import { stattype } from "meter-core/packets/generated/enums";
import * as LogLines from "./log-lines";
import { tryParseInt } from "./util";
import {
  EntitySkills,
  Breakdown,
  Entity,
  HealSource,
  Game,
  StatusEffect,
  StatusEffectBuffTypeFlags,
  StatusEffectTarget,
} from "./data";
import { healingSkills, HitFlag, HitOption } from "./constants";

function createEntitySkill(): EntitySkills {
  const newEntitySkill: EntitySkills = {
    id: 0,
    name: "",
    icon: "",
    damageDealt: 0,
    damageDealtDebuffedBySupport: 0,
    damageDealtBuffedBySupport: 0,
    maxDamage: 0,
    hits: {
      casts: 0,
      total: 0,
      crit: 0,
      backAttack: 0,
      frontAttack: 0,
      counter: 0,
      hitsDebuffedBySupport: 0,
      hitsBuffedBySupport: 0,
      hitsBuffedBy: new Map(),
      hitsDebuffedBy: new Map(),
    },
    breakdown: [],
    damageDealtDebuffedBy: new Map(),
    damageDealtBuffedBy: new Map(),
  };
  return newEntitySkill;
}

function createEntity(): Entity {
  const newEntity: Entity = {
    lastUpdate: 0,
    id: "",
    npcId: 0,
    name: "",
    class: "",
    classId: 0,
    isPlayer: false,
    isDead: false,
    deaths: 0,
    deathTime: 0,
    gearScore: 0,
    currentHp: 0,
    maxHp: 0,
    damageDealt: 0,
    damageDealtDebuffedBySupport: 0,
    damageDealtBuffedBySupport: 0,
    healingDone: 0,
    shieldDone: 0,
    damageTaken: 0,
    skills: {},
    hits: {
      casts: 0,
      total: 0,
      crit: 0,
      backAttack: 0,
      frontAttack: 0,
      counter: 0,
      hitsDebuffedBySupport: 0,
      hitsBuffedBySupport: 0,
      hitsBuffedBy: new Map(),
      hitsDebuffedBy: new Map(),
    },
    damageDealtDebuffedBy: new Map(),
    damageDealtBuffedBy: new Map(),
  };
  return newEntity;
}

export class LogParser extends EventEmitter {
  resetTimer: ReturnType<typeof setTimeout> | null;

  debugLines: boolean;
  isLive: boolean;
  dontResetOnZoneChange: boolean;
  resetAfterPhaseTransition: boolean;
  splitOnPhaseTransition: boolean;
  removeOverkillDamage: boolean;

  phaseTransitionResetRequest: boolean;
  phaseTransitionResetRequestTime: number;

  game!: Game;
  encounters: Game[];
  healSources!: HealSource[];

  meterData: MeterData;

  constructor(meterData: MeterData, isLive = false) {
    super();

    this.meterData = meterData;

    this.resetTimer = null;

    this.debugLines = false;
    this.isLive = isLive;
    this.dontResetOnZoneChange = false;
    this.resetAfterPhaseTransition = false;
    this.splitOnPhaseTransition = false;
    this.removeOverkillDamage = true;

    this.phaseTransitionResetRequest = false;
    this.phaseTransitionResetRequestTime = 0;

    this.resetState();
    this.encounters = [];

    if (this.isLive) {
      setInterval(this.broadcastStateChange.bind(this), 100);
    }
  }
  updateOrCreateLocalPlayer(newLocal: string) {
    //Keep local player if exist, and update id to new one (/!\ we'll have to track the next newpc for localplayer spawn)
    if (this.game && newLocal !== "") {
      const localPlayerEntity = this.game.entities[this.game.localPlayer];
      if (localPlayerEntity) {
        //Update existing
        this.updateEntity(this.game.localPlayer, {
          id: newLocal,
          name: localPlayerEntity.name,
          class: localPlayerEntity.class,
          classId: localPlayerEntity.classId,
          isPlayer: true,
          gearScore: localPlayerEntity.gearScore,
        });
      } else {
        //Create empty localplayer
        this.game.localPlayer = "You";
        this.updateEntity(this.game.localPlayer, {
          id: newLocal,
          name: "You",
          isPlayer: true,
        });
      }
    }
  }
  resetState() {
    if (this.debugLines)
      this.emit("log", {
        type: "debug",
        message: "Resetting state",
      });

    const clone = cloneDeep(this.game);
    const curTime = +new Date();
    let entities: { [key: string]: Entity } = {};
    this.game = {
      startedOn: curTime,
      lastCombatPacket: curTime,
      fightStartedOn: 0,
      localPlayer: this.game?.localPlayer ?? "", //We never reset localplayer outside of initenv or initpc
      entities,
      damageStatistics: {
        totalDamageDealt: 0,
        topDamageDealt: 0,
        totalDamageTaken: 0,
        topDamageTaken: 0,
        totalHealingDone: 0,
        topHealingDone: 0,
        totalShieldDone: 0,
        topShieldDone: 0,
        debuffs: new Map(),
        buffs: new Map(),
      },
    };

    if (clone && clone.localPlayer !== "") {
      const localPlayerEntity = clone.entities[this.game.localPlayer];
      if (localPlayerEntity)
        this.updateEntity(localPlayerEntity.name, {
          id: localPlayerEntity.id,
          name: localPlayerEntity.name,
          class: localPlayerEntity.class,
          classId: localPlayerEntity.classId,
          isPlayer: true,
          gearScore: localPlayerEntity.gearScore,
        });
    }
    this.healSources = [];
    this.emit("reset-state", clone);
  }
  softReset() {
    this.resetTimer = null;
    const entitiesCopy = cloneDeep(this.game.entities);
    this.resetState();
    for (const entity of Object.values(entitiesCopy)) {
      this.updateEntity(entity.name, {
        name: entity.name,
        npcId: entity.npcId,
        class: entity.class,
        classId: entity.classId,
        isPlayer: entity.isPlayer,
        gearScore: entity.gearScore,
        maxHp: entity.maxHp,
        currentHp: entity.currentHp,
      });
    }
  }
  cancelReset() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.resetTimer = null;
  }
  splitEncounter(softReset = false) {
    const curState = cloneDeep(this.game);
    if (
      curState.fightStartedOn != 0 && // no combat packets
      (curState.damageStatistics.totalDamageDealt != 0 || curState.damageStatistics.totalDamageTaken) // no player damage dealt OR taken
    )
      this.encounters.push(curState);
    if (softReset) this.softReset();
    else this.resetState();
  }

  broadcastStateChange() {
    const clone: Game = cloneDeep(this.game);
    // Dont send breakdowns; will hang up UI
    Object.values(clone.entities).forEach((entity) => {
      Object.values(entity.skills).forEach((skill) => {
        skill.breakdown = [];
      });
    });

    this.emit("state-change", clone);
  }

  parseLogLine(line: string) {
    if (!line) return;

    const lineSplit = line.trim().split("|");
    if (lineSplit.length < 1 || !lineSplit[0]) return;

    const logType = tryParseInt(lineSplit[0]);

    try {
      switch (logType) {
        case 0:
          this.onMessage(lineSplit);
          break;
        case 1:
          this.onInitEnv(lineSplit);
          break;
        case 2:
          this.onPhaseTransition(lineSplit);
          break;
        case 3:
          this.onNewPc(lineSplit);
          break;
        case 4:
          this.onNewNpc(lineSplit);
          break;
        case 5:
          this.onDeath(lineSplit);
          break;
        case 6:
          this.onSkillStart(lineSplit);
          break;
        case 7:
          this.onSkillStage(lineSplit);
          break;
        case 8:
          this.onDamage(lineSplit);
          break;
        case 9:
          this.onHeal(lineSplit);
          break;
        case 10:
          this.onBuff(lineSplit);
          break;
        case 12:
          this.onCounterattack(lineSplit);
          break;
      }
    } catch (e) {
      this.emit("log", { type: "error", message: e });
    }
  }

  updateEntity(entityName: string, values: Record<string, unknown>) {
    const updateTime = { lastUpdate: +new Date() };
    let entity;
    if (!(entityName in this.game.entities)) {
      entity = {
        ...createEntity(),
        ...values,
        ...updateTime,
      };
    } else {
      entity = {
        ...createEntity(),
        ...this.game.entities[entityName],
        ...values,
        ...updateTime,
      };
    }
    this.game.entities[entityName] = entity;
    return entity;
  }

  // logId = 0
  onMessage(lineSplit: string[]) {
    const logLine = new LogLines.LogMessage(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onMessage: ${logLine.message}`,
      });
    }

    if (!logLine.message.startsWith("Arguments:")) {
      this.emit("message", logLine.message);
    }
  }

  // logId = 1
  onInitEnv(lineSplit: string[]) {
    const logLine = new LogLines.LogInitEnv(lineSplit);
    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: "onInitEnv",
      });
    }
    //Update localplayer
    this.updateOrCreateLocalPlayer(logLine.playerId);

    if (this.isLive) {
      //Cleanup entities that are not displayed (we keep others in case user want to keep his previous encounter)
      for (const key in this.game.entities) {
        if (this.game.entities[key]?.name !== this.game.localPlayer && this.game.entities[key]?.hits.total === 0)
          delete this.game.entities[key];
      }

      if (this.dontResetOnZoneChange === false && this.resetTimer == null) {
        if (this.debugLines) {
          this.emit("log", {
            type: "debug",
            message: "Setting a reset timer",
          });
        }

        //Then
        this.resetTimer = setTimeout(() => {
          this.softReset();
        }, 6000);
        this.emit("message", "new-zone");
      }
    } else {
      this.splitEncounter();
      this.emit("message", "new-zone");
    }
  }

  // logId = 2
  onPhaseTransition(lineSplit: string[]) {
    const logLine = new LogLines.LogPhaseTransition(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onPhaseTransition: ${logLine.phaseCode}`,
      });
    }

    if (this.isLive) {
      this.emit("message", `phase-transition-${logLine.phaseCode}`);

      if (this.resetAfterPhaseTransition) {
        this.phaseTransitionResetRequest = true;
        this.phaseTransitionResetRequestTime = +new Date();
      }
    }

    if (!this.isLive && this.splitOnPhaseTransition) {
      this.splitEncounter(true);
    }
  }

  // logId = 3
  onNewPc(lineSplit: string[]) {
    const logLine = new LogLines.LogNewPc(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onNewPc: ${logLine.id}, ${logLine.name}, ${logLine.classId}, ${logLine.class}, ${logLine.gearScore}, ${logLine.currentHp}, ${logLine.maxHp}`,
      });
    }
    if (this.game && this.game.localPlayer !== "") {
      const localPlayerEntity = this.game.entities[this.game.localPlayer];
      if (localPlayerEntity && localPlayerEntity.id === logLine.id) {
        //We tracked new localPlayer
        //We don't delete old one, in case user want to keep log active,
        //but it's not local player so it'll be delete on zone change
        //delete this.game.entities[this.game.localPlayer];
        this.game.localPlayer = logLine.name;
      }
    }
    this.updateEntity(logLine.name, {
      id: logLine.id,
      name: logLine.name,
      class: logLine.class,
      classId: logLine.classId,
      isPlayer: true,
      ...(logLine.gearScore && logLine.gearScore != 0 && { gearScore: logLine.gearScore }),
      currentHp: logLine.currentHp,
      maxHp: logLine.maxHp,
    });
  }

  // logId = 4
  onNewNpc(lineSplit: string[]) {
    const logLine = new LogLines.LogNewNpc(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onNewNpc: ${logLine.id}, ${logLine.name}, ${logLine.currentHp}, ${logLine.maxHp}`,
      });
    }

    this.updateEntity(logLine.name, {
      id: logLine.id,
      name: logLine.name,
      npcId: logLine.npcId,
      isPlayer: false,
      currentHp: logLine.currentHp,
      maxHp: logLine.maxHp,
    });
  }

  // logId = 5
  onDeath(lineSplit: string[]) {
    const logLine = new LogLines.LogDeath(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onDeath: ${logLine.name} ${logLine.killerName}`,
      });
    }

    const entity = this.game.entities[logLine.name];

    let deaths = 0;
    if (!entity) deaths = 1;
    else if (entity.isDead) deaths = entity.deaths;
    else deaths = entity.deaths + 1;

    this.updateEntity(logLine.name, {
      name: logLine.name,
      isDead: true,
      deathTime: +logLine.timestamp,
      deaths,
    });
  }

  // logId = 6
  onSkillStart(lineSplit: string[]) {
    const logLine = new LogLines.LogSkillStart(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onSkillStart: ${logLine.id}, ${logLine.name}, ${logLine.skillId}, ${logLine.skillName}`,
      });
    }
    const healingSkill = healingSkills[logLine.skillId];
    if (healingSkill) {
      this.healSources.push({
        source: logLine.name,
        expires: +logLine.timestamp + healingSkill.duration,
      });
    }

    this.updateEntity(logLine.name, {
      name: logLine.name,
      isDead: false,
    });

    const entity = this.game.entities[logLine.name];
    if (entity) {
      entity.hits.casts += 1;
      let skill = entity.skills[logLine.skillId];
      if (!skill) {
        skill = {
          ...createEntitySkill(),
          ...{
            id: logLine.skillId,
          },
          ...this.getSkillNameIcon(logLine.skillId, 0, logLine.skillName),
        };
        entity.skills[logLine.skillId] = skill;
      }

      skill.hits.casts += 1;
    }
  }

  // logId = 7
  onSkillStage(lineSplit: string[]) {
    const logLine = new LogLines.LogSkillStage(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onSkillStage: ${logLine.name}, ${logLine.skillId}, ${logLine.skillName}, ${logLine.skillStage}`,
      });
    }
  }

  // logId = 8
  onDamage(lineSplit: string[]) {
    if (lineSplit.length < 13) return;
    const logLine = new LogLines.LogDamage(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onDamage: ${logLine.id}, ${logLine.name}, ${logLine.skillId}, ${logLine.skillName}, ${logLine.skillEffectId}, ${logLine.skillEffect}, ${logLine.targetId}, ${logLine.targetName}, ${logLine.damage}, ${logLine.currentHp}, ${logLine.maxHp}`,
      });
    }

    if (
      this.phaseTransitionResetRequest &&
      this.phaseTransitionResetRequestTime > 0 &&
      this.phaseTransitionResetRequestTime < +new Date() - 8000
    ) {
      this.softReset();
      this.phaseTransitionResetRequest = false;
    }

    this.updateEntity(logLine.name, {
      id: logLine.id,
      name: logLine.name,
    });

    this.updateEntity(logLine.targetName, {
      id: logLine.targetId,
      name: logLine.targetName,
      currentHp: logLine.currentHp,
      maxHp: logLine.maxHp,
    });

    const damageOwner = this.game.entities[logLine.name];
    const damageTarget = this.game.entities[logLine.targetName];
    if (!damageOwner || !damageTarget) return;
    if (!damageTarget.isPlayer && this.removeOverkillDamage && logLine.currentHp < 0) {
      logLine.damage = logLine.damage + logLine.currentHp;
    }
    let skillId = logLine.skillId,
      skillName = logLine.skillName;
    if (logLine.skillId === 0 && logLine.skillEffectId !== 0) {
      skillId = logLine.skillEffectId;
      skillName = logLine.skillEffect;
    }
    let skill = damageOwner.skills[skillId];
    if (!skill) {
      skill = {
        ...createEntitySkill(),
        ...{
          id: skillId,
        },
        ...this.getSkillNameIcon(logLine.skillId, logLine.skillEffectId, logLine.skillName),
      };
      damageOwner.skills[skillId] = skill;
    }

    const hitFlag: HitFlag = logLine.damageModifier & 0xf;
    const hitOption: HitOption = ((logLine.damageModifier >> 4) & 0x7) - 1;

    // TODO: Keeping for now; Not sure if referring to damage share on Valtan G1 or something else
    // TODO: Not sure if this is fixed in the logger
    //if (logLine.skillName === "Bleed" && logLine.damage > 10000000) return;

    // Remove 'sync' bleeds on G1 Valtan
    if (skillName === "Bleed" && hitFlag === HitFlag.HIT_FLAG_DAMAGE_SHARE) return;

    const isCrit = hitFlag === HitFlag.HIT_FLAG_CRITICAL || hitFlag === HitFlag.HIT_FLAG_DOT_CRITICAL;
    const isBackAttack = hitOption === HitOption.HIT_OPTION_BACK_ATTACK;
    const isFrontAttack = hitOption === HitOption.HIT_OPTION_FRONTAL_ATTACK;

    // map status effects
    const mappedSeOnSource: Set<number> = new Set();
    const mappedSeOnTarget: Set<number> = new Set();
    logLine.statusEffectsOnSource.forEach((buffId) => {
      mappedSeOnSource.add(buffId[0] as number);
    });
    logLine.statusEffectsOnTarget.forEach((buffId) => {
      mappedSeOnTarget.add(buffId[0] as number);
    });

    const critCount = isCrit ? 1 : 0;
    const backAttackCount = isBackAttack ? 1 : 0;
    const frontAttackCount = isFrontAttack ? 1 : 0;

    skill.damageDealt += logLine.damage;
    if (logLine.damage > skill.maxDamage) skill.maxDamage = logLine.damage;

    damageOwner.damageDealt += logLine.damage;
    damageTarget.damageTaken += logLine.damage;

    //if (logLine.skillName !== "Bleed") {
    damageOwner.hits.total += 1;
    damageOwner.hits.crit += critCount;
    damageOwner.hits.backAttack += backAttackCount;
    damageOwner.hits.frontAttack += frontAttackCount;

    skill.hits.total += 1;
    skill.hits.crit += critCount;
    skill.hits.backAttack += backAttackCount;
    skill.hits.frontAttack += frontAttackCount;
    //}

    if (damageOwner.isPlayer) {
      this.game.damageStatistics.totalDamageDealt += logLine.damage;
      this.game.damageStatistics.topDamageDealt = Math.max(
        this.game.damageStatistics.topDamageDealt,
        damageOwner.damageDealt
      );
      //#region Player buff
      let isBuffedBySupport = false,
        isDebuffedBySupport = false;

      mappedSeOnSource.forEach((buffId) => {
        //TODO: cache invalid results (if statusEffect is undefined, don't query again every time)
        if (!this.game.damageStatistics.buffs.has(buffId)) {
          const statusEffect = this.getStatusEffectHeaderData(buffId);
          if (statusEffect) this.game.damageStatistics.buffs.set(buffId, statusEffect);
        }
        const statusEffect = this.game.damageStatistics.buffs.get(buffId);
        if (statusEffect && !isBuffedBySupport) {
          isBuffedBySupport =
            (statusEffect.buffcategory === "classskill" ||
              statusEffect.buffcategory === "identity" ||
              statusEffect.buffcategory === "ability") &&
            statusEffect.source.skill !== undefined &&
            this.meterData.isSupportClassId(statusEffect.source.skill.classid);
        }
      });
      mappedSeOnTarget.forEach((buffId) => {
        if (!this.game.damageStatistics.debuffs.has(buffId)) {
          const statusEffect = this.getStatusEffectHeaderData(buffId);
          if (statusEffect) this.game.damageStatistics.debuffs.set(buffId, statusEffect);
        }
        const statusEffect = this.game.damageStatistics.debuffs.get(buffId);
        if (statusEffect && !isDebuffedBySupport) {
          isDebuffedBySupport =
            (statusEffect.buffcategory === "classskill" ||
              statusEffect.buffcategory === "identity" ||
              statusEffect.buffcategory === "ability") &&
            statusEffect.source.skill !== undefined &&
            this.meterData.isSupportClassId(statusEffect.source.skill.classid);
        }
      });

      const debuffAttackCount = isDebuffedBySupport ? 1 : 0;
      const buffAttackCount = isBuffedBySupport ? 1 : 0;

      skill.damageDealtBuffedBySupport += isBuffedBySupport ? logLine.damage : 0;
      skill.damageDealtDebuffedBySupport += isDebuffedBySupport ? logLine.damage : 0;

      mappedSeOnSource.forEach((buffId) => {
        const oldval = skill!.damageDealtBuffedBy.get(buffId) ?? 0;
        skill!.damageDealtBuffedBy.set(buffId, oldval + logLine.damage);
        const oldOwnerDamage = damageOwner.damageDealtBuffedBy.get(buffId) ?? 0;
        damageOwner.damageDealtBuffedBy.set(buffId, oldOwnerDamage + logLine.damage);
      });
      mappedSeOnTarget.forEach((buffId) => {
        const oldSkillDmg = skill!.damageDealtDebuffedBy.get(buffId) ?? 0;
        skill!.damageDealtDebuffedBy.set(buffId, oldSkillDmg + logLine.damage);
        const oldOwnerDamage = damageOwner.damageDealtDebuffedBy.get(buffId) ?? 0;
        damageOwner.damageDealtDebuffedBy.set(buffId, oldOwnerDamage + logLine.damage);
      });

      damageOwner.damageDealtBuffedBySupport += isBuffedBySupport ? logLine.damage : 0;
      damageOwner.damageDealtDebuffedBySupport += isDebuffedBySupport ? logLine.damage : 0;

      damageOwner.hits.hitsBuffedBySupport += buffAttackCount;
      damageOwner.hits.hitsDebuffedBySupport += debuffAttackCount;
      mappedSeOnSource.forEach((buffId) => {
        const oldHitAmountTotal = damageOwner.hits.hitsBuffedBy.get(buffId) ?? 0;
        damageOwner.hits.hitsBuffedBy.set(buffId, oldHitAmountTotal + 1);
        const oldHitAmountSkill = skill!.hits.hitsBuffedBy.get(buffId) ?? 0;
        skill!.hits.hitsBuffedBy.set(buffId, oldHitAmountSkill + 1);
      });
      mappedSeOnTarget.forEach((buffId) => {
        const oldHitAmountTotal = damageOwner.hits.hitsDebuffedBy.get(buffId) ?? 0;
        damageOwner.hits.hitsDebuffedBy.set(buffId, oldHitAmountTotal + 1);
        const oldHitAmountSkill = skill!.hits.hitsDebuffedBy.get(buffId) ?? 0;
        skill!.hits.hitsDebuffedBy.set(buffId, oldHitAmountSkill + 1);
      });

      skill.hits.hitsBuffedBySupport += buffAttackCount;
      skill.hits.hitsDebuffedBySupport += debuffAttackCount;

      //#endregion

      const breakdown: Breakdown = {
        timestamp: +logLine.timestamp,
        damage: logLine.damage,
        targetEntity: damageTarget.id,
        isCrit,
        isBackAttack,
        isFrontAttack,
        isBuffedBySupport: isBuffedBySupport,
        isDebuffedBySupport: isDebuffedBySupport,
        buffedBy: [...mappedSeOnSource],
        debuffedBy: [...mappedSeOnTarget],
      };

      skill.breakdown.push(breakdown);
    }

    if (damageTarget.isPlayer) {
      this.game.damageStatistics.totalDamageTaken += logLine.damage;
      this.game.damageStatistics.topDamageTaken = Math.max(
        this.game.damageStatistics.topDamageTaken,
        damageTarget.damageTaken
      );
    }

    if (this.game.fightStartedOn === 0) this.game.fightStartedOn = +logLine.timestamp;
    this.game.lastCombatPacket = +logLine.timestamp;
  }

  // logId = 9
  onHeal(lineSplit: string[]) {
    const logLine = new LogLines.LogHeal(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onHeal: ${logLine.id}, ${logLine.name}, ${logLine.healAmount}`,
      });
    }

    let sourceName = "";
    for (const source of this.healSources) {
      if (source.expires >= +logLine.timestamp) {
        sourceName = source.source;
        break;
      }
    }
    if (!sourceName) return;

    const entity = this.updateEntity(sourceName, {
      name: sourceName,
    });

    entity.healingDone += logLine.healAmount;

    if (entity.isPlayer) {
      this.game.damageStatistics.totalHealingDone += logLine.healAmount;
      this.game.damageStatistics.topHealingDone = Math.max(
        this.game.damageStatistics.topHealingDone,
        entity.healingDone
      );
    }
  }

  // logId = 10
  onBuff(lineSplit: string[]) {
    const logLine = new LogLines.LogBuff(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onBuff: ${logLine.id}, ${logLine.name}, ${logLine.buffId}, ${logLine.buffName}, ${logLine.sourceId}, ${logLine.sourceName}, ${logLine.shieldAmount}`,
      });
    }

    if (logLine.shieldAmount && logLine.isNew) {
      const entity = this.updateEntity(logLine.name, {
        name: logLine.name,
      });

      entity.shieldDone += logLine.shieldAmount;

      if (entity.isPlayer) {
        this.game.damageStatistics.totalShieldDone += logLine.shieldAmount;
        this.game.damageStatistics.topShieldDone = Math.max(
          this.game.damageStatistics.topShieldDone,
          entity.shieldDone
        );
      }
    }
  }

  // logId = 12
  onCounterattack(lineSplit: string[]) {
    const logLine = new LogLines.LogCounterattack(lineSplit);

    if (this.debugLines) {
      this.emit("log", {
        type: "debug",
        message: `onCounterattack: ${logLine.id}, ${logLine.name}`,
      });
    }

    const entity = this.updateEntity(logLine.name, {
      name: logLine.name,
    });

    // TODO: Add skill name from logger
    entity.hits.counter += 1;
  }
  getSkillNameIcon(skillId: number, skillEffectId: number, skillName: string): { name: string; icon?: string } {
    if (skillId === 0 && skillEffectId === 0) {
      return { name: "Bleed", icon: "buff_168.png" };
    } else if (skillId === 0) {
      const effect = this.meterData.skillEffect.get(skillEffectId);
      // TODO: change log file & meter core to get projectile info in damage log line
      // Using projectile.skillEffectId, we can get what name was thrown (splendid or not)
      // See stagger meter for reference
      if (effect && effect.itemname) {
        return { name: effect.itemname, icon: effect.icon ?? "" };
      } else if (effect) {
        return { name: effect.comment };
      } else {
        return { name: skillName };
      }
    } else {
      let skill = this.meterData.skill.get(skillId);
      if (!skill) {
        skill = this.meterData.skill.get(skillId - (skillId % 10));
        if (!skill) return { name: skillName, icon: "" };
      }

      if (skill.summonsourceskill) {
        skill = this.meterData.skill.get(skill.summonsourceskill);
        if (skill) {
          return { name: skill.name + " (Summon)", icon: skill.icon };
        } else {
          return { name: skillName, icon: "" };
        }
      } else if (skill.sourceskill) {
        skill = this.meterData.skill.get(skill.sourceskill);
        if (skill) {
          return { name: skill.name, icon: skill.icon };
        } else {
          return { name: skillName, icon: "" };
        }
      } else {
        return { name: skill.name, icon: skill.icon };
      }
    }
  }
  getStatusEffectHeaderData(buffId: number) {
    const buff = this.meterData.skillBuff.get(buffId);
    if (!buff || buff.iconshowtype === "none") return;
    // Category override
    let buffcategory;
    if (buff.buffcategory === "ability" && [501, 502, 503, 504, 505].includes(buff.uniquegroup)) {
      buffcategory = "dropsofether";
    } else {
      buffcategory = buff.buffcategory;
    }
    const statusEffect: StatusEffect = {
      target:
        buff.target === "none"
          ? StatusEffectTarget.OTHER
          : buff.target === "self"
          ? StatusEffectTarget.SELF
          : StatusEffectTarget.PARTY, // self+party
      category: buff.category,
      buffcategory,
      bufftype: this.getStatusEffectBuffTypeFlags(buff),
      uniquegroup: buff.uniquegroup,
      source: {
        name: buff.name,
        desc: buff.desc,
        icon: buff.icon,
      },
    };
    if (buffcategory === "classskill" || buffcategory === "identity") {
      let buffSourceSkill;
      if (buff.sourceskill) {
        // Source skill from db
        buffSourceSkill = this.meterData.skill.get(buff.sourceskill);
        if (buffSourceSkill) statusEffect.source.skill = buffSourceSkill;
      } else {
        // Try to guess
        //const skillId = Math.floor(buff.uniquegroup / 100) * 10;
        const skillId = Math.floor(buff.uniquegroup / 10);
        buffSourceSkill = this.meterData.skill.get(skillId);
      }
      if (buffSourceSkill) statusEffect.source.skill = buffSourceSkill;
    } else if (buffcategory === "ability" && buff.uniquegroup !== 0) {
      let buffSourceSkill;
      if (buff.sourceskill) {
        // Source skill from db
        buffSourceSkill = this.meterData.skill.get(buff.sourceskill);
        if (buffSourceSkill) statusEffect.source.skill = buffSourceSkill;
      } else {
        // Try to guess
        //const skillId = Math.floor(buff.uniquegroup / 100) * 10;
        const skillId = Math.floor(buff.uniquegroup / 10);
        buffSourceSkill = this.meterData.skill.get(skillId);
      }
      if (buffSourceSkill) statusEffect.source.skill = buffSourceSkill;
    } else if (buffcategory === "set" && buff.setname) {
      statusEffect.source.setname = buff.setname;
    }

    return statusEffect;
  }
  getStatusEffectBuffTypeFlags(buff: SkillBuff) {
    let bufftype = StatusEffectBuffTypeFlags.NONE;

    // Extract type from Buff type
    //TODO check & apply condition of buffs
    if (
      [
        "weaken_defense",
        "weaken_resistance",
        "skill_damage_amplify",
        "beattacked_damage_amplify",
        "skill_damage_amplify_attack",
        "directional_attack_amplify",
        "instant_stat_amplify",
        "attack_power_amplify",
        "instant_stat_amplify_by_contents",
      ].includes(buff.type)
    ) {
      bufftype |= StatusEffectBuffTypeFlags.DMG;
    } else if (["move_speed_down", "all_speed_down"].includes(buff.type)) {
      bufftype |= StatusEffectBuffTypeFlags.MOVESPEED;
    } else if (["reset_cooldown"].includes(buff.type)) {
      bufftype |= StatusEffectBuffTypeFlags.COOLDOWN;
    } else if (["change_ai_point", "ai_point_amplify"].includes(buff.type)) {
      bufftype |= StatusEffectBuffTypeFlags.STAGGER;
    } else if (["increase_identity_gauge"].includes(buff.type)) {
      bufftype |= StatusEffectBuffTypeFlags.RESOURCE;
    } /*
    else if (["aura"].includes(buff.type)) {
      //TODO: look into ValueA to get the buff applied by the aura (probably useless as we'll get the buff itself)
    }*/

    // Extract type from passive options
    buff.passiveoption.forEach((option) => {
      if (option.type === "stat") {
        const stat = stattype[option.keystat as keyof typeof stattype];
        if (!stat) return; //Important, as the previous trick might return undefined
        if ([stattype.mastery, stattype.mastery_x, stattype.paralyzation_point_rate].includes(stat)) {
          bufftype |= StatusEffectBuffTypeFlags.STAGGER;
        }
        if ([stattype.rapidity, stattype.rapidity_x, stattype.cooldown_reduction].includes(stat)) {
          bufftype |= StatusEffectBuffTypeFlags.COOLDOWN;
        }
        if (
          [
            stattype.max_mp,
            stattype.max_mp_x,
            stattype.max_mp_x_x,
            stattype.normal_mp_recovery,
            stattype.combat_mp_recovery,
            stattype.normal_mp_recovery_rate,
            stattype.combat_mp_recovery_rate,
            stattype.resource_recovery_rate,
          ].includes(stat)
        ) {
          bufftype |= StatusEffectBuffTypeFlags.RESOURCE;
        }
        if (
          [
            stattype.con,
            stattype.con_x,
            stattype.max_hp,
            stattype.max_hp_x,
            stattype.max_hp_x_x,
            stattype.normal_hp_recovery,
            stattype.combat_hp_recovery,
            stattype.normal_hp_recovery_rate,
            stattype.combat_hp_recovery_rate,
            stattype.self_recovery_rate,
            stattype.drain_hp_dam_rate,
            stattype.vitality,
          ].includes(stat)
        ) {
          bufftype |= StatusEffectBuffTypeFlags.HP;
        }
        if (
          (stattype.def <= stat && stat <= stattype.magical_inc_rate) ||
          [stattype.endurance, stattype.endurance_x].includes(stat)
        ) {
          if ((buff.category === "buff" && option.value >= 0) || (buff.category === "debuff" && option.value <= 0)) {
            bufftype |= StatusEffectBuffTypeFlags.DMG;
          } else bufftype |= StatusEffectBuffTypeFlags.DEFENSE;
        }
        if (stattype.move_speed <= stat && stat <= stattype.vehicle_move_speed_rate) {
          bufftype |= StatusEffectBuffTypeFlags.MOVESPEED;
        }
        if (
          [stattype.attack_speed, stattype.attack_speed_rate, stattype.rapidity, stattype.rapidity_x].includes(stat)
        ) {
          bufftype |= StatusEffectBuffTypeFlags.ATKSPEED;
        }
        if ([stattype.critical_hit_rate, stattype.criticalhit, stattype.criticalhit_x].includes(stat)) {
          bufftype |= StatusEffectBuffTypeFlags.CRIT;
        }
        if (
          (stattype.attack_power_sub_rate_1 <= stat && stat <= stattype.skill_damage_sub_rate_2) ||
          (stattype.fire_dam_rate <= stat && stat <= stattype.elements_dam_rate) ||
          [
            stattype.str,
            stattype.agi,
            stattype.int,
            stattype.str_x,
            stattype.agi_x,
            stattype.int_x,
            stattype.char_attack_dam,
            stattype.attack_power_rate,
            stattype.skill_damage_rate,
            stattype.attack_power_rate_x,
            stattype.skill_damage_rate_x,
            stattype.hit_rate,
            stattype.dodge_rate,
            stattype.critical_dam_rate,
            stattype.awakening_dam_rate,
            stattype.attack_power_addend,
            stattype.weapon_dam,
          ].includes(stat)
        ) {
          if ((buff.category === "buff" && option.value >= 0) || (buff.category === "debuff" && option.value <= 0)) {
            bufftype |= StatusEffectBuffTypeFlags.DMG;
          } else bufftype |= StatusEffectBuffTypeFlags.DEFENSE;
        }
      } else if ("skill_critical_ratio" === option.type) {
        bufftype |= StatusEffectBuffTypeFlags.CRIT;
      } else if (
        ["skill_damage", "class_option", "skill_group_damage", "skill_critical_damage", "skill_penetration"].includes(
          option.type
        )
      ) {
        if ((buff.category === "buff" && option.value >= 0) || (buff.category === "debuff" && option.value <= 0)) {
          bufftype |= StatusEffectBuffTypeFlags.DMG;
        } else bufftype |= StatusEffectBuffTypeFlags.DEFENSE;
      } else if (["skill_cooldown_reduction", "skill_group_cooldown_reduction"].includes(option.type)) {
        bufftype |= StatusEffectBuffTypeFlags.COOLDOWN;
      } else if (["skill_mana_reduction", "mana_reduction"].includes(option.type)) {
        bufftype |= StatusEffectBuffTypeFlags.RESOURCE;
      } else if ("combat_effect" === option.type) {
        // Extract type from combat_effect
        const combatEffect = this.meterData.combatEffect.get(option.keyindex);
        if (!combatEffect) return;
        //TODO: evaluate conditions ? or maybe it should be done on meter core & remove those buffs
        combatEffect.actions.forEach((action) => {
          if (
            [
              "modify_damage",
              "modify_final_damage",
              "modify_critical_multiplier",
              "modify_penetration",
              "modify_penetration_when_critical",
              "modify_penetration_addend",
              "modify_penetration_addend_when_critical",
              "modify_damage_shield_multiplier",
            ].includes(action.type)
          ) {
            bufftype |= StatusEffectBuffTypeFlags.DMG;
          } else if ("modify_critical_ratio" === action.type) {
            bufftype |= StatusEffectBuffTypeFlags.CRIT;
          }
        });
      }
    });
    return bufftype;
  }
}
