import {SYSTEM} from "../config/system.js";

/**
 * Data and functionality that represents a Spell in the Crucible spellcraft system.
 */
export default class CrucibleSpell extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      name: new fields.StringField(),
      img: new fields.FilePathField({categories: ["IMAGE"]}),
      description: new fields.HTMLField(),
      rune: new fields.StringField({required: true, choices: SYSTEM.SPELL.RUNES}),
      gesture: new fields.StringField({required: true, choices: SYSTEM.SPELL.GESTURES}),
      inflection: new fields.StringField({required: false, choices: SYSTEM.SPELL.INFLECTIONS})
    }
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  _initialize(options) {
    super._initialize(options);
    this.id = ["spell", this.rune, this.gesture, this.inflection].filterJoin(".");
    this.rune = SYSTEM.SPELL.RUNES[this.rune];
    this.gesture = SYSTEM.SPELL.GESTURES[this.gesture];
    this.inflection = SYSTEM.SPELL.INFLECTIONS[this.inflection];
    this.name ||= CrucibleSpell.#getDefaultName(this);
    this.img ||= this.rune.img;
    this.scaling = new Set([this.rune.scaling, this.gesture.scaling]);
    this.cost = CrucibleSpell.#prepareCost(this);
    this.target = CrucibleSpell.#prepareTarget(this);
  }

  /* -------------------------------------------- */

  /**
   * Prepare the cost for the spell from its components.
   * @param {CrucibleSpell} spell     The spell being prepared
   * @returns {ActionCost}            Configured cost data
   */
  static #prepareCost(spell) {
    const cost = {...spell.gesture.cost};
    if ( spell.inflection ) {
      cost.action += spell.inflection.cost.action;
      cost.focus += spell.inflection.cost.focus;
    }
    return cost;
  }

  /* -------------------------------------------- */

  /**
   * Prepare the target data for the Spell based on its components.
   * @param {CrucibleSpell} spell     The spell being prepared
   * @returns {ActionTarget}          Configured target data
   */
  static #prepareTarget(spell) {
    const scopes = SYSTEM.ACTION.TARGET_SCOPES;
    const target = {...spell.gesture.target};
    switch ( target.type ) {
      case "none":
        target.scope = scopes.NONE;
        break;
      case "self":
        target.scope = scopes.SELF;
        break;
      case "single":
        target.scope = scopes[spell.rune.restoration ? "ALLIES" : "ENEMIES"];
        break;
      default:
        target.scope = scopes.ALL;
        break;
    }
    return target;
  }

  /* -------------------------------------------- */

  /**
   * Prepare a default name for the spell if a custom name has not been designated.
   * @type {string}
   */
  static #getDefaultName({rune, gesture, inflection}={}) {
    const format = inflection ? "SPELL.DefaultNameAdjective" : "SPELL.DefaultName";
    return game.i18n.format(format, {rune, gesture, adjective: inflection?.adjective});
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Obtain an object of tags which describe the Spell.
   * @returns {ActionTags}
   */
  getTags() {
    const tags = {
      activation: {},
      action: {},
      context: {}
    };

    // Activation Tags
    tags.activation.hands = `${this.gesture.hands}H`;
    if ( this.cost.action > 0 ) tags.activation.ap = `${this.cost.action}A`;
    if ( this.cost.focus > 0 ) tags.activation.fp = `${this.cost.focus}F`;
    if ( !(this.cost.action || this.cost.focus)) tags.activation.free = "Free";

    // Action Tags
    tags.action.scaling = Array.from(this.scaling).map(a => SYSTEM.ABILITIES[a].label).join("/");
    tags.action.defense = SYSTEM.SAVE_DEFENSES[this.rune.save].label;
    tags.action.resource = SYSTEM.RESOURCES[this.rune.resource].label;
    return tags;
  }
}
