/**
 * The cost in skill points to obtain the next skill rank
 * @type {number[]}
 */
export const SKILL_RANKS = {
  0: {
    label: "SKILL.Untrained",
    description: "You have no formal training in this area. Any success you have is due to luck.",
    cost: 0,
    bonus: -4,
    path: false
  },
  1: {
    label: "SKILL.Novice",
    description: "You have been provided basic instruction or acquired practical experience in the basics of this skill.",
    cost: 1,
    bonus: 0,
    path: false
  },
  2: {
    label: "SKILL.Apprentice",
    description: "You have practiced and honed your skills to a strong functional degree.",
    cost: 2,
    bonus: 2,
    path: false
  },
  3: {
    label: "SKILL.Journeyman",
    description: "You are a subject matter expert in this area.",
    cost: 4,
    bonus: 4,
    path: true
  },
  4: {
    label: "SKILL.Master",
    description: "You are a true master of this skill and its techniques.",
    cost: 7,
    bonus: 8,
    path: false
  },
  5: {
    label: "SKILL.Grandmaster",
    description: "You are peerless in your mastery of this area.",
    cost: 12,
    bonus: 12,
    path: true
  }
};


/**
 * The cost in skill points to obtain the next skill rank
 * @type {number[]}
 */
export const SKILL_CATEGORIES = {
  "exp": {
    label: "Exploration",
    defaultIcon: "icons/skills/no-exp.jpg"
  },
  "kno": {
    label: "Knowledge",
    defaultIcon: "icons/skills/no-kno.jpg"
  },
  "soc": {
    label: "Social",
    defaultIcon: "icons/skills/no-soc.jpg"
  },
  "trd": {
    label: "Tradecraft",
    defaultIcon: "icons/skills/no-trd.jpg"
  }
};


// The starting outline of each skill. The final structure of the SKILLS const is derived from this data.
export const SKILLS = {
  "acrobatics": {
    name:"SKILLS.Acrobatics",
    category:"exp",
    attributes: ["strength", "dexterity"],
    paths: ["gymnast", "traceur", "dancer"]
  },
  "perception": {
    name:"SKILLS.Perception",
    category:"exp",
    attributes: ["intellect", "wisdom"],
    paths: ["scout", "sentry", "empath"]
  },
  "stealth": {
    name:"SKILLS.Stealth",
    category:"exp",
    attributes: ["dexterity", "intellect"],
    paths: ["infiltrator", "safecracker", "pickpocket"]
  },
  "survival": {
    name:"SKILLS.Survival",
    category:"exp",
    attributes: ["constitution", "wisdom"],
    paths: ["explorer", "hunter", "herbalist"]
  },
  "arcana": {
    name:"SKILLS.Arcana",
    category:"kno",
    attributes: ["intellect", "wisdom"],
    paths: ["diviner", "elementalist", "enchanter"]
  },
  "investigation": {
    name:"SKILLS.Investigation",
    category:"kno",
    attributes: ["intellect", "charisma"],
    paths: ["detective", "spy", "tinkerer"]
  },
  "lore": {
    name:"SKILLS.Lore",
    category:"kno",
    attributes: ["intellect", "wisdom"],
    paths: ["scholar", "historian", "storyteller"]
  },
  "religion": {
    name:"SKILLS.Religion",
    category:"kno",
    attributes: ["wisdom", "charisma"],
    paths: ["theologian", "crusader", "druid"]
  },
  "bartering": {
    name:"SKILLS.Bartering",
    category:"soc",
    attributes: ["intellect", "charisma"],
    paths: ["antiquarian", "caravaner", "negotiator"]
  },
  "deception": {
    name:"SKILLS.Deception",
    category:"soc",
    attributes: ["intellect", "charisma"],
    paths: ["grifter", "illusionist", "mesmer"]
  },
  "diplomacy": {
    name:"SKILLS.Diplomacy",
    category:"soc",
    attributes: ["wisdom", "charisma"],
    paths: ["dip1", "dip2", "dip3"]
  },
  "intimidation": {
    name:"SKILLS.Intimidation",
    category:"soc",
    attributes: ["strength", "charisma"],
    paths: ["int1", "int2", "int3"]
  },
  "animal": {
    name:"SKILLS.AnimalHandling",
    category:"trd",
    attributes: ["strength", "wisdom"],
    paths: ["knight", "beastmaster", "warden"]
  },
  "craftsmanship": {
    name:"SKILLS.Craftsmanship",
    category:"trd",
    attributes: ["dexterity", "intellect"],
    paths: ["trademaster", "artificer", "runekeeper"]
  },
  "medicine": {
    name:"SKILLS.Medicine",
    category:"trd",
    attributes: ["constitution", "intellect"],
    paths: ["apothecary", "chirurgeon", "occultist"]
  },
  "performance": {
    name:"SKILLS.Performance",
    category:"trd",
    attributes: ["dexterity", "charisma"],
    paths: ["musician", "artist", "athlete"]
  },
};


/**
 * Combine and configure Skills data to create an official record of skill progression throughout the system
 * Freeze the resulting object so it cannot be modified downstream
 * @param {Object} skills
 * @return {Object}
 */
function expandSkillConfig(skills) {
  for ( let [id, skill] of Object.entries(skills) ) {

    // Cache the internationalization prefix
    const langPrefix = skill.name;

    // Construct the skill object
    skill.id = id;
    skill.icon = `icons/skills/${id}.jpg`;
    skill.description = `${langPrefix}/Info`;
    skill.ranks = [];

    // Construct specialization paths
    skill.paths = skill.paths.reduce((paths, id) => {
      const lang = langPrefix + id.titleCase();
      paths[id] = {
        name: lang,
        icon: `icons/skills/${id}.jpg`,
        description: `${lang}Info`,
        ranks: []
      };
      return paths;
    }, {});

    // Populate rank information
    for (let [i, rank] of Object.entries(SKILL_RANKS)) {
      skill.ranks[i] = {
        rank: i,
        description: `${langPrefix}Rank${i}`
      };
      if ( i === "3" ) skill.ranks[i].description = "SKILL.ChoosePath";
      else if ( i === "5" ) skill.ranks[i].description = "SKILL.MasterPath";
      if (rank.path) {
        for (let path of Object.values(skill.paths)) {
          path.ranks[i] = {
            rank: i,
            description: `${path.name}${i}`
          };
        }
      }
    }
  }
  return skills;
}
expandSkillConfig(SKILLS);


/**
 * Translate the SKILLS configuration object using localization strings
 * @param skills
 */
export function localizeSkillConfig(skills, systemId) {
  for ( let skill of Object.values(skills) ) {
    skill.name = game.i18n.localize(skill.name);
    skill.icon = `systems/${systemId}/${skill.icon}`;
    skill.description = game.i18n.localize(`SKILLS.${skill.name}Info`);
    for ( let p of Object.values(skill.paths) ) {
      p.name = game.i18n.localize(p.name);
      p.description = game.i18n.localize(p.description);
      p.ranks.forEach(r => r.description = game.i18n.localize(r.description));
    }
    skill.ranks.forEach(r => r.description = game.i18n.localize(r.description));
  }
  Object.freeze(skills);
}
