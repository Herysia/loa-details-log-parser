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
  500130, 500131, 500148, 500149, 500152, 500153, 552911 // Paladin: Blessed Aura
]);

export const supportSynergyIds = new Set([
  210230, 212610, // Bard: Note Brand
  360506, 360804, 361004, 361207, 361505, // Paladin: Light's Vestige
]);

export const playerDebuffIds = new Set([
  192612, 193207, 191720, 192306, 193207, // Arcana: Party Weakness Exposure
  301830, // Artillerist: Party: Target Focus
  300510, 300902, // Artillerist: Party: Armor Destruction
  210230, 212610, // Bard: Note Brand
  //212801, // Bard: Oratorio
  //212302, 212303, 212304, // Bard: Symphonia
  161210, // Berserker: Party: Damage Amplification
  291230, 291820, 292220, // Deadeye: Party: Weakness Exposure
  382220, // Deadeye Female: Party: Weakness Exposure
  251221, 251220, // Deathblade: Open Weakness
  181804, 180111, 181660, 181103, // Destroyer: Party: Armor Destruction
  341706, 341707, // Glavier: Shackling Blue Dragon, Critical Spear
  170404, 171002, 171502, // Gunlancer: Party: Armor Destruction
  171807, 171803, // Gunlancer: Open Weakness
  381820, 382030, // Gunslinger: Party: Weakness Exposure
  380201, 380202, 380203, // Gunslinger: Life Absorption,
  281114, // Hawkeye: Party: Damage Amplification
  360506, 360804, 361004, 361207, 361505, // Paladin: Light's Vestige
  280010, // Reaper: Corrosion
  231803, 230906, 230611, // Scrapper: Party: Damage Amplification
  270501, 278100, 271704, // Shadowhunter: Party: Damage Amplification
  280412, 280212, // Sharpshooter: Party: Damage Amplification
  372020, 372120, 372452, // Sorceress: Party: Damage Amplification
  390801,  // Striker: Lightning Whisper (What is Fatal Lightning?)
  220805, 220801, // Wardancer: Fatal Wave, Roar of Courage
  605000033, 605000034, 605000035, 605000036, // Dagger Bracelet Effect
  605000037, 605000038, 605000039, 605000040, // Expose Weakness Bracelet Effect
  271303, 161102, 162230, // Party: Damage Amplification
  300402, 301006, 181103, // Party: Armor Destruction
  250411, 251311, 45113702, // Open Weakness
  250410, 251310, // Party: Open Weakness
  321120, 321320, 321730, // Party: Weakness Exposure
  182107, 232105, // Party: Target Focus one of these is Scrapper
]);

export const playerBuffIds = new Set([
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
  500130, 500131, 500148, 500149, 500152, 500153, 552911 // Paladin: Blessed Aura
]);

export const playerBuffMap = new Map([
  [211601, 211604], [211605, 211604], [211606, 211604], [211608, 211604], [211609, 211604], // Bard Buffs
  [211410, 211400], [211411, 211400], [211401, 211400], [211420, 211400], [211421, 211400], [211423, 211400], [211424, 211400], [211425, 211400], // Bard Courage
  [242507, 357501], [241800,357501], [242200, 357501], [567117, 357501], [350403, 357501], [350502, 357501], [357501, 357501], [352003, 357501], [352002, 357501], // Soulfist/Machinist Fighting Spirit
  [220703, 220703], [221229, 220703], [221604, 220703], [220307, 220703], [230203, 220703], [242508, 220703], [241801, 220703], [170402, 220703], [170802, 220703], [170901, 220703], [171901, 220703], // Ready Attack
  [251640, 251641], // Deathblade: Dark Order
  [171300, 171307], // Gunlancer: Nellasia's Energy
  [360101, 360101], [360102, 360101], [500130, 360101], [500131, 360101], [500148, 360101], [500149, 360101], [500152, 360101], [500153, 360101], [552911, 360101] // Paladin Blessed Aura and Holy Aura to Holy Aura
]);

export const playerDebuffMap = new Map([
  [192612, 192612], [193207, 192612], [191720, 192612], [192306, 192612], [193207, 192612], 
  [300510, 300510], [300902, 300510],
  [210230, 210230], [212610, 210230],
  [291230, 291230], [291820, 291230], [292220, 291230],
  [251221, 251221], [251220, 251221],
  [181804, 181804], [180111, 181804], [181660, 181804], [181103, 181804],
  [341706, 341706], [341707, 341706],
  [170404, 170404], [171002, 170404], [171502, 170404],
  [171807, 171807], [171803, 171807],
  [381820, 381820], [382030, 381820],
  [380201, 380201], [380202, 380201], [380203, 380201],
  [360506, 360506], [360804, 360506], [361004, 360506], [361207, 360506], [361505, 360506],
  [231803, 231803], [230906, 231803], [230611, 231803],
  [270501, 270501], [278100, 270501], [271704, 270501],
  [280412, 280412], [280212, 280412],
  [372020, 372020], [372120, 372020], [372452, 372020],
  [220805, 220805], [220801, 220805],
  [605000033, 605000033], [605000034, 605000033], [605000035, 605000033], [605000036, 605000033],
  [605000037, 605000037], [605000038, 605000037], [605000039, 605000037], [605000040, 605000037],
]);