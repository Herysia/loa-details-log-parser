interface HealingSkills {
  [key: string]: HealingSkillDetails;
}
interface HealingSkillDetails {
  duration: number;
}
export const healingSkills: HealingSkills = {
  "Serenade of Salvation": {
    duration: 3
  },
  "Holy Aura": {
    duration: 16 * 1000
  },
  "Holy Protection": {
    duration: 7 * 1000
  },
  Demonize: {
    duration: 1.5 * 1000
  }
};

export enum HitOption {
  HIT_OPTION_NONE = -1,
  HIT_OPTION_BACK_ATTACK = 0,
  HIT_OPTION_FRONTAL_ATTACK = 1,
  HIT_OPTION_FLANK_ATTACK = 2,
  HIT_OPTION_MAX = 3,
}

export enum HitFlag {
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
  HIT_FLAG_MAX = 13,
}


export const supportAttackBuffIds = new Set([
  211400, 211410, 211411, 211401, 211420, 211421, 211423, 211424, 211425, // Serenade of Courage
  211604, 211601, 211605, 211606, 211608, 211609, // Bard Buffs
  211749, // Bard Buff
  361708, 362006, // Paladin Valor and Express Fury
  500130, 552911, // Paladin: Blessed Aura
]);

export const supportSynergyIds = new Set([
  210230, 212610, // Bard: Note Brand
  360506, 360804, 361004, 361207, 361505, // Paladin: Light's Vestige
]);

export const playerDebuffIds = new Set([
  301830, // Artillerist: Party: Target Focus
  210230, 212610, // Bard: Note Brand
  212302, 212303, 212304, // Bard: Symphonia
  170404, // Gunlancer: Party: Armor Destruction
  171807, // Gunlancer: Open Weakness
  360506, 360804, 361004, 361207, 361505, // Paladin: Light's Vestige
  280010, // Reaper: Corrosion
  270501, 278100, // Shadowhunter: Party: Damage Amplification
  280412, // Sharpshooter: Party: Damage Amplification
  372020, // Sorceress: Party: Damage Amplification
  220805, 220801, // Wardancer: Fatal Wave, Roar of Courage
  271303, 271704, 230611, 230906, 231803, 280212, // Party: Damage Amplification
  281114, 372120, 372452, 161102, 161210, 162230, // Party: Damage Amplification
  300402, 300510, 300902, 301006, 171002, 171502, 180111, // Party: Armor Destruction
  181103, 181660, 181804, // Party: Armor Destruction
  171807, 250411, 251221, 251311, 45113702, // Open Weakness
  171803, 250410, 251220, 251310, // Party: Open Weakness
  380201, 380202, 380203, // Life Absorption
  191720, 192306, 192612, 193207, 291230, 291820, 292220, // Party: Weakness Exposure
  321120, 321320, 321730, 381820, 382030, 382220, // Party: Weakness Exposure
  182107, 232105, // Party: Target Focus one of these is Scrapper
  341706, 341707, // Glavier: Shackling Blue Dragon, Critical Spear
  390801,  // Striker: Lightning Whisper (What is Fatal Lightning?)
  212801, // Bard: Oratorio
]);

export const playerBuffIds = new Set([
  500033, // Drops of Ether (the no new drops debuff)
  703, // Defense Orb
  702, // Wind Orb
  704, // Strength Orb
  705, // Flash Orb
  211400, 211410, 211411, 211401, 211420, 211421, 211423, 211424, 211425, // Serenade of Courage
  211604, 211601, 211605, 211606, 211608, 211609, // Bard Buffs
  211749, // Bard Buff
  361708, 362006, // Paladin Valor and Express Fury
  242507, 241800, 242200, 567117, 350403, 350502, 357501, 352002, 352003, // Soulfist/Machinist Party: Fighting Spirit Enhancement
  220703, 221229, 221604, 220307, 230203, 242508, 241801, 170402, 170802, 170901, 171901, // Ready Attack Gunlancer?
  390802, // Striker: Lightning's Blessing
  221200, // Wardancer: Wind's Whisper
  251640, 251641, // Deathblade: Dark Order
  171300, 171307, // Gunlancer: Nellasia's Energy
  360101, 360102, // Paladin: Holy Aura
  500130, 552911, // Paladin: Blessed Aura
  500131, // Paladin: Aura of Blessing
]);

export const playerBuffMap = new Map([
  [211601, 211604], [211605, 211604], [211606, 211604], [211608, 211604], [211609, 211604], // Bard Buffs
  [211410, 211400], [211411, 211400], [211401, 211400], [211420, 211400], [211421, 211400], [211423, 211400], [211424, 211400], [211425, 211400], // Bard Courage
  [242507, 357501], [241800,357501], [242200, 357501], [567117, 357501], [350403, 357501], [350502, 357501], [357501, 357501], [352003, 357501], [352002, 357501], // Soulfist/Machinist Fighting Spirit
  [220703, 220703], [221229, 220703], [221604, 220703], [220307, 220703], [230203, 220703], [242508, 220703], [241801, 220703], [170402, 220703], [170802, 220703], [170901, 220703], [171901, 220703], // Ready Attack
  [251640, 251641], // Deathblade: Dark Order
  [171300, 171307], // Gunlancer: Nellasia's Energy
  [360101, 360101], [360102, 360101], // Paladin: Holy Aura
  [500130, 500130], [552911, 500130], // Paladin: Blessed Aura
]);