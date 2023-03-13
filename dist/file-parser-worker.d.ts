import { MeterData } from 'meter-core/dist/data';

declare function fileParserWorker(filename: string, splitOnPhaseTransition: boolean, mainFolder: string, parsedLogFolder: string, meterData: MeterData, callback: CallableFunction): any;

export { fileParserWorker };
