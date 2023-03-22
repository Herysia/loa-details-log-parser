import { EventEmitter } from 'events';
import { MeterData, SkillBuff } from 'meter-core/data';
import { Game, HealSource, Entity, StatusEffect, StatusEffectBuffTypeFlags } from './data.js';

declare class LogParser extends EventEmitter {
    resetTimer: ReturnType<typeof setTimeout> | null;
    debugLines: boolean;
    isLive: boolean;
    dontResetOnZoneChange: boolean;
    resetAfterPhaseTransition: boolean;
    splitOnPhaseTransition: boolean;
    removeOverkillDamage: boolean;
    phaseTransitionResetRequest: boolean;
    phaseTransitionResetRequestTime: number;
    game: Game;
    encounters: Game[];
    healSources: HealSource[];
    meterData: MeterData;
    constructor(meterData: MeterData, isLive?: boolean);
    updateOrCreateLocalPlayer(newLocal: string): void;
    resetState(): void;
    softReset(): void;
    cancelReset(): void;
    splitEncounter(softReset?: boolean): void;
    broadcastStateChange(): void;
    parseLogLine(line: string): void;
    updateEntity(entityName: string, values: Record<string, unknown>): Entity;
    onMessage(lineSplit: string[]): void;
    onInitEnv(lineSplit: string[]): void;
    onPhaseTransition(lineSplit: string[]): void;
    onNewPc(lineSplit: string[]): void;
    onNewNpc(lineSplit: string[]): void;
    onDeath(lineSplit: string[]): void;
    onSkillStart(lineSplit: string[]): void;
    onSkillStage(lineSplit: string[]): void;
    onDamage(lineSplit: string[]): void;
    onHeal(lineSplit: string[]): void;
    onBuff(lineSplit: string[]): void;
    onCounterattack(lineSplit: string[]): void;
    getSkillNameIcon(skillId: number, skillEffectId: number, skillName: string): {
        name: string;
        icon?: string;
    };
    getStatusEffectHeaderData(buffId: number): StatusEffect | undefined;
    getStatusEffectBuffTypeFlags(buff: SkillBuff): StatusEffectBuffTypeFlags;
}

export { LogParser };
