import type { Skill } from "meter-core/data";

export enum StatusEffectTarget {
  OTHER,
  PARTY,
  SELF,
}
export enum StatusEffectBuffTypeFlags {
  NONE = 0,
  DMG = 1,
  CRIT = 1 << 1,
  ATKSPEED = 1 << 2,
  MOVESPEED = 1 << 3,
  HP = 1 << 4,
  DEFENSE = 1 << 5,
  RESOURCE = 1 << 6, //mana ?
  COOLDOWN = 1 << 7,
  STAGGER = 1 << 8,
  SHIELD = 1 << 9, //TODO nothing is mapped there

  ANY = 1 << 50, // ignore all filters if set
}
export interface StatusEffect {
  target: StatusEffectTarget;
  category: "buff" | "debuff";
  buffcategory: string; //buffshowprioritycategory
  bufftype: StatusEffectBuffTypeFlags;
  uniquegroup: number;
  source: StatusEffectSource; //Used to hold the header info
}
export interface StatusEffectSource {
  name: string;
  desc: string;
  icon: string;
  skill?: Skill;
  setname?: string;
}
export interface DamageStatistics {
  totalDamageDealt: number;
  topDamageDealt: number;
  totalDamageTaken: number;
  topDamageTaken: number;
  totalHealingDone: number;
  topHealingDone: number;
  totalShieldDone: number;
  topShieldDone: number;
  topShieldGotten: number;
  totalEffectiveShieldingDone: number;
  topEffectiveShieldingDone: number;
  topEffectiveShieldingUsed: number;
  debuffs: Map<number, StatusEffect>;
  buffs: Map<number, StatusEffect>;
  effectiveShieldingBuffs: Map<number, StatusEffect>;
  appliedShieldingBuffs: Map<number, StatusEffect>;
}
export interface Game {
  startedOn: number;
  lastCombatPacket: number;
  fightStartedOn: number;
  localPlayer: string;
  currentBoss: Entity | undefined;
  entities: Map<string, Entity>;
  damageStatistics: DamageStatistics;
}
export interface GameNew {
  startedOn: number;
  lastCombatPacket: number;
  fightStartedOn: number;
  entities: Map<string, Entity>;
  damageStatistics: DamageStatistics;
}
export interface HealSource {
  source: string;
  expires: number;
}

export interface Entity {
  lastUpdate: number;
  id: string;
  npcId: number;
  name: string;
  class: string;
  classId: number;
  isBoss: boolean;
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
  shieldReceived: number;
  damageTaken: number;
  skills: Map<number, EntitySkills>;
  hits: Hits;
  damageDealtDebuffedBy: Map<number, number>;
  damageDealtBuffedBy: Map<number, number>;
  damagePreventedWithShieldOnOthers: number;
  damagePreventedByShield: number;
  damagePreventedWithShieldOnOthersBy: Map<number, number>;
  damagePreventedByShieldBy: Map<number, number>
  shieldDoneBy: Map<number, number>;
  shieldReceivedBy: Map<number, number>;
}

export interface Breakdown {
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

export interface EntitySkills {
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

export interface Hits {
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
