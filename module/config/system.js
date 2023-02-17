import {SKILL_CATEGORIES, SKILL_RANKS, SKILLS} from "./skills.js";
import * as ACTION from "./action.mjs";
import * as ARMOR from "./armor.js";
import * as dice from "./dice.js";
import * as EFFECTS from "./effects.mjs";
import * as SPELL from "./spellcraft.mjs";
import * as WEAPON from "./weapon.js";
import {QUALITY_TIERS, ENCHANTMENT_TIERS} from "./items.js";
export const SYSTEM_ID = "crucible";

/**
 * The primary attributes which are called abilities.
 * @type {{
 *   strength: {label: string, abbreviation: string},
 *   toughness: {label: string, abbreviation: string},
 *   dexterity: {label: string, abbreviation: string},
 *   intellect: {label: string, abbreviation: string},
 *   presence: {label: string, abbreviation: string},
 *   wisdom: {label: string, abbreviation: string}
 * }}
 */
export const ABILITIES = Object.freeze({
  strength: {
    label: "ABILITIES.Strength",
    abbreviation: "ABILITIES.StrengthAbbr"
  },
  toughness: {
    label: "ABILITIES.Toughness",
    abbreviation: "ABILITIES.ToughnessAbbr"
  },
  dexterity: {
    label: "ABILITIES.Dexterity",
    abbreviation: "ABILITIES.DexterityAbbr"
  },
  intellect: {
    label: "ABILITIES.Intellect",
    abbreviation: "ABILITIES.IntellectAbbr"
  },
  presence: {
    label: "ABILITIES.Presence",
    abbreviation: "ABILITIES.PresenceAbbr"
  },
  wisdom: {
    label: "ABILITIES.Wisdom",
    abbreviation: "ABILITIES.WisdomAbbr"
  }
});

/* -------------------------------------------- */

/**
 * The amount of damage resistance granted by ancestries.
 * @type {object}
 */
export const ANCESTRIES = {
  primaryAttributeStart: 3,
  secondaryAttributeStart: 2,
  resistanceAmount: 5
}

/* -------------------------------------------- */

/**
 * The compendium pack IDs which should be used as the source for character creation materials.
 * @enum {string}
 */
export const COMPENDIUM_PACKS = {
  ancestry: "crucible.ancestry",
  background: "crucible.background",
  talent: "crucible.talent"
}

/* -------------------------------------------- */

/**
 * Define the top level damage categories.
 * @enum {{id: string, label: string}}
 */
export const DAMAGE_CATEGORIES = Object.freeze({
  physical: {
    id: "physical",
    label: "DAMAGE.Physical"
  },
  elemental: {
    id: "elemental",
    label: "DAMAGE.Elemental"
  },
  spiritual: {
    id: "spiritual",
    label: "DAMAGE.Spiritual"
  }
});

/* -------------------------------------------- */

/**
 * Define the individual damage types within each damage category.
 * @enum {{id: string, label: string, type: string}}
 */
export const DAMAGE_TYPES = Object.freeze({
  bludgeoning: {
    id: "bludgeoning",
    label: "DAMAGE.Bludgeoning",
    type: "physical"
  },
  piercing: {
    id: "piercing",
    label: "DAMAGE.Piercing",
    type: "physical"
  },
  slashing: {
    id: "slashing",
    label: "DAMAGE.Slashing",
    type: "physical"
  },
  poison: {
    id: "poison",
    label: "DAMAGE.Poison",
    type: "physical"
  },
  acid: {
    id: "acid",
    label: "DAMAGE.Acid",
    type: "elemental"
  },
  fire: {
    id: "fire",
    label: "DAMAGE.Fire",
    type: "elemental"
  },
  frost: {
    id: "frost",
    label: "DAMAGE.Frost",
    type: "elemental"
  },
  lightning: {
    id: "lightning",
    label: "DAMAGE.Lightning",
    type: "elemental"
  },
  psychic: {
    id: "psychic",
    label: "DAMAGE.Psychic",
    type: "spiritual"
  },
  radiant: {
    id: "radiant",
    label: "DAMAGE.Radiant",
    type: "spiritual"
  },
  unholy: {
    id: "unholy",
    label: "DAMAGE.Unholy",
    type: "spiritual"
  },
  void: {
    id: "void",
    label: "DAMAGE.Void",
    type: "spiritual"
  }
});


/* -------------------------------------------- */

/**
 * @typedef {Object}  CrucibleResource    A resource pool available to an Actor within the system
 * @property {string} id                  The resource id
 * @property {string} label               The localized full label for the resource
 * @property {string} abbreviation        The localized abbreviation for the resource
 * @property {string} type                The type of resource, "active" or "reserve"
 * @property {string} tooltip             The tooltip formula for the resource
 * @property {{high: number, low: number, heal: number}} color  Displayed colors for the resource
 */

/**
 * Define the resource pools which are tracked for each character
 * @enum {CrucibleResource}
 */
export const RESOURCES = Object.freeze({
  health: {
    id: "health",
    label: "ATTRIBUTES.Health",
    abbreviation: "ATTRIBUTES.Health",
    type: "active",
    tooltip: "[4 &times; (Level + Toughness)] + [2 &times; (Strength + Dexterity)]",
    color: {
      high: Color.from(0xEE0000),
      low: Color.from(0xAA0000),
      heal: Color.from(0x00EE00)
    },
  },
  wounds: {
    id: "wounds",
    label: "ATTRIBUTES.Wounds",
    abbreviation: "ATTRIBUTES.Wounds",
    type: "reserve",
    tooltip: "Health &times; 2",
    color: {
      high: Color.from(0xEE0000),
      low: Color.from(0xAA0000),
      heal: Color.from(0x00EE00)
    },
  },
  morale: {
    id: "morale",
    label: "ATTRIBUTES.Morale",
    abbreviation: "ATTRIBUTES.Morale",
    type: "active",
    tooltip: "[4 &times; (Level + Presence)] + [2 &times; (Intellect + Wisdom)]",
    color: {
      high: Color.from(0x9900CC),
      low: Color.from(0x6600AA),
      heal: Color.from(0x9900CC)
    }
  },
  madness: {
    id: "madness",
    label: "ATTRIBUTES.Madness",
    abbreviation: "ATTRIBUTES.Madness",
    tooltip: "Morale &times; 2",
    type: "reserve",
    color: {
      high: Color.from(0x9900CC),
      low: Color.from(0x6600AA),
      heal: Color.from(0x9900CC)
    }
  },
  action: {
    id: "action",
    label: "ATTRIBUTES.Action",
    abbreviation: "ATTRIBUTES.Action",
    tooltip: "3 + Action Bonus",
    type: "active",
    color: {
      high: Color.from(0xFF9900),
      low: Color.from(0xCC6600),
      heal: Color.from(0xFF9900)
    }
  },
  focus: {
    id: "focus",
    label: "ATTRIBUTES.Focus",
    abbreviation: "ATTRIBUTES.Focus",
    tooltip: "(0.5 &times; Level) + Max(Wisdom, Presence, Intellect)",
    type: "active",
    color: {
      high: Color.from(0x0066FF),
      low: Color.from(0x0033CC),
      heal: Color.from(0x0066FF)
    }
  }
});

/**
 * The base threshold for passive checks onto which bonuses are added.
 * @type {number}
 */
export const PASSIVE_BASE = 12;

/* -------------------------------------------- */

/**
 * The defense types which can be used to counter an attack roll.
 * @type {object}
 */
export const DEFENSES = {
  physical: {
    label: "DEFENSES.Physical",
    type: "physical"
  },
  fortitude: {
    label: "DEFENSES.Fortitude",
    abilities: ["strength", "toughness"],
    tooltip: `${PASSIVE_BASE} + Strength + Toughness`,
    type: "save"
  },
  reflex: {
    label: "DEFENSES.Reflex",
    abilities: ["dexterity", "intellect"],
    tooltip: `${PASSIVE_BASE} + Dexterity + Intellect`,
    type: "save"
  },
  willpower: {
    label: "DEFENSES.Willpower",
    abilities: ["wisdom", "presence"],
    tooltip: `${PASSIVE_BASE} + Wisdom + Presence`,
    type: "save"
  },
  wounds: {
    label: "DEFENSES.Wounds",
    tooltip: `${PASSIVE_BASE} + (Wounds / 10)`,
    type: "threshold"
  },
  madness: {
    label: "DEFENSES.Madness",
    tooltip: `${PASSIVE_BASE} + (Madness / 10)`,
    type: "threshold"
  }
}

/* -------------------------------------------- */


/**
 * Include all constant definitions within the SYSTEM global export
 * @type {Object}
 */
export const SYSTEM = {
  id: SYSTEM_ID,
  name: "Crucible (WIP)",
  activeCheckFormula: "3d8",
  ACTION,
  ARMOR,
  dice: dice,
  ABILITIES,
  ANCESTRIES,
  COMPENDIUM_PACKS,
  DAMAGE_CATEGORIES,
  DAMAGE_TYPES,
  DEFENSES,
  EFFECTS,
  ENCHANTMENT_TIERS,
  PASSIVE_BASE,
  QUALITY_TIERS,
  RESOURCES,
  SKILL_CATEGORIES,
  SKILL_RANKS,
  SKILLS,
  SPELL,
  WEAPON,
};
