declare class LogLine {
    lineSplit: string[];
    timestamp: Date;
    constructor(lineSplit: string[]);
}
declare class LogMessage extends LogLine {
    message: string;
    constructor(lineSplit: string[]);
}
declare class LogInitEnv extends LogLine {
    playerId: string;
    constructor(lineSplit: string[]);
}
declare class LogPhaseTransition extends LogLine {
    phaseCode: number;
    constructor(lineSplit: string[]);
}
declare class LogNewPc extends LogLine {
    id: string;
    name: string;
    classId: number;
    class: string;
    gearScore: number;
    currentHp: number;
    maxHp: number;
    constructor(lineSplit: string[]);
}
declare class LogNewNpc extends LogLine {
    id: string;
    npcId: number;
    name: string;
    currentHp: number;
    maxHp: number;
    constructor(lineSplit: string[]);
}
declare class LogDeath extends LogLine {
    id: string;
    name: string;
    killerId: string;
    killerName: string;
    constructor(lineSplit: string[]);
}
declare class LogSkillStart extends LogLine {
    id: string;
    name: string;
    skillId: number;
    skillName: string;
    constructor(lineSplit: string[]);
}
declare class LogSkillStage extends LogLine {
    id: string;
    name: string;
    skillId: string;
    skillName: string;
    skillStage: number;
    constructor(lineSplit: string[]);
}
declare class LogDamage extends LogLine {
    id: string;
    name: string;
    skillId: number;
    skillName: string;
    skillEffectId: number;
    skillEffect: string;
    targetId: string;
    targetName: string;
    damage: number;
    damageModifier: number;
    currentHp: number;
    maxHp: number;
    constructor(lineSplit: string[]);
}
declare class LogHeal extends LogLine {
    id: string;
    name: string;
    healAmount: number;
    constructor(lineSplit: string[]);
}
declare class LogBuff extends LogLine {
    id: string;
    name: string;
    buffId: string;
    buffName: string;
    isNew: boolean;
    sourceId: string;
    sourceName: string;
    shieldAmount: number;
    constructor(lineSplit: string[]);
}
declare class LogCounterattack extends LogLine {
    id: string;
    name: string;
    constructor(lineSplit: string[]);
}

export { LogBuff, LogCounterattack, LogDamage, LogDeath, LogHeal, LogInitEnv, LogMessage, LogNewNpc, LogNewPc, LogPhaseTransition, LogSkillStage, LogSkillStart };
