import { MeterData } from 'meter-core/dist/data';

type FileWorkerOptions = {
    filename: string;
    splitOnPhaseTransition: boolean;
    mainFolder: string;
    parsedLogFolder: string;
    meterData?: MeterData;
    meterDataPath?: string;
    dbPath?: string;
};
declare function fileParserWorker(options: FileWorkerOptions, callback: CallableFunction): any;

export { FileWorkerOptions, fileParserWorker };
