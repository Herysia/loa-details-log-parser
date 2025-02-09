interface HealingSkills {
    [key: string]: HealingSkillDetails;
}
interface HealingSkillDetails {
    duration: number;
}
declare const healingSkills: HealingSkills;
declare enum HitOption {
    HIT_OPTION_NONE = -1,
    HIT_OPTION_BACK_ATTACK = 0,
    HIT_OPTION_FRONTAL_ATTACK = 1,
    HIT_OPTION_FLANK_ATTACK = 2,
    HIT_OPTION_MAX = 3
}
declare enum HitFlag {
    HIT_FLAG_NORMAL = 0,
    HIT_FLAG_CRITICAL = 1,
    HIT_FLAG_MISS = 2,
    HIT_FLAG_INVINCIBLE = 3,
    HIT_FLAG_DOT = 4,
    HIT_FLAG_IMMUNE = 5,
    HIT_FLAG_IMMUNE_SILENCED = 6,
    HIT_FLAG_FONT_SILENCED = 7,
    HIT_FLAG_DOT_CRITICAL = 8,
    HIT_FLAG_DODGE = 9,
    HIT_FLAG_REFLECT = 10,
    HIT_FLAG_DAMAGE_SHARE = 11,
    HIT_FLAG_DODGE_HIT = 12,
    HIT_FLAG_MAX = 13
}
declare const supportAttackBuffIds: Set<number>;
declare const supportSynergyIds: Set<number>;
declare const playerDebuffIds: Set<number>;
declare const playerBuffIds: Set<number>;
declare const playerBuffMap: Map<number, number>;
declare const playerDebuffMap: Map<number, number>;

export { HitFlag, HitOption, healingSkills, playerBuffIds, playerBuffMap, playerDebuffIds, playerDebuffMap, supportAttackBuffIds, supportSynergyIds };
