import { Skill } from 'meter-core/data';

declare enum StatusEffectTarget {
    OTHER = 0,
    PARTY = 1,
    SELF = 2
}
declare enum StatusEffectBuffTypeFlags {
    NONE = 0,
    DMG = 1,
    CRIT = 2,
    ATKSPEED = 4,
    MOVESPEED = 8,
    HP = 16,
    DEFENSE = 32,
    RESOURCE = 64,
    COOLDOWN = 128,
    STAGGER = 256,
    SHIELD = 512,
    ANY = 262144
}
interface StatusEffect {
    target: StatusEffectTarget;
    category: "buff" | "debuff";
    buffcategory: string;
    bufftype: StatusEffectBuffTypeFlags;
    uniquegroup: number;
    source: StatusEffectSource;
}
interface StatusEffectSource {
    name: string;
    desc: string;
    icon: string;
    skill?: Skill;
    setname?: string;
}
interface DamageStatistics {
    totalDamageDealt: number;
    topDamageDealt: number;
    totalDamageTaken: number;
    topDamageTaken: number;
    totalHealingDone: number;
    topHealingDone: number;
    totalShieldDone: number;
    topShieldDone: number;
    debuffs: Map<number, StatusEffect>;
    buffs: Map<number, StatusEffect>;
}
interface Game {
    startedOn: number;
    lastCombatPacket: number;
    fightStartedOn: number;
    localPlayer: string;
    entities: {
        [name: string]: Entity;
    };
    damageStatistics: DamageStatistics;
}
interface GameNew {
    startedOn: number;
    lastCombatPacket: number;
    fightStartedOn: number;
    entities: {
        [name: string]: Entity;
    };
    damageStatistics: DamageStatistics;
}
interface HealSource {
    source: string;
    expires: number;
}
interface Entity {
    lastUpdate: number;
    id: string;
    npcId: number;
    name: string;
    class: string;
    classId: number;
    isPlayer: boolean;
    isDead: boolean;
    deaths: number;
    deathTime: number;
    gearScore: number;
    currentHp: number;
    maxHp: number;
    damageDealt: number;
    damageDealtDebuffedBySupport: number;
    damageDealtBuffedBySupport: number;
    healingDone: number;
    shieldDone: number;
    damageTaken: number;
    skills: {
        [name: string]: EntitySkills;
    };
    hits: Hits;
    damageDealtDebuffedBy: Map<number, number>;
    damageDealtBuffedBy: Map<number, number>;
}
interface Breakdown {
    timestamp: number;
    damage: number;
    targetEntity: string;
    isCrit: boolean;
    isBackAttack: boolean;
    isFrontAttack: boolean;
    isBuffedBySupport: boolean;
    isDebuffedBySupport: boolean;
    debuffedBy: number[];
    buffedBy: number[];
}
interface EntitySkills {
    id: number;
    name: string;
    icon: string | undefined;
    damageDealt: number;
    damageDealtDebuffedBySupport: number;
    damageDealtBuffedBySupport: number;
    maxDamage: number;
    hits: Hits;
    breakdown: Breakdown[];
    damageDealtDebuffedBy: Map<number, number>;
    damageDealtBuffedBy: Map<number, number>;
}
interface Hits {
    casts: number;
    total: number;
    crit: number;
    backAttack: number;
    frontAttack: number;
    counter: number;
    hitsDebuffedBySupport: number;
    hitsBuffedBySupport: number;
    hitsBuffedBy: Map<number, number>;
    hitsDebuffedBy: Map<number, number>;
}

export { Breakdown, DamageStatistics, Entity, EntitySkills, Game, GameNew, HealSource, Hits, StatusEffect, StatusEffectBuffTypeFlags, StatusEffectSource, StatusEffectTarget };
