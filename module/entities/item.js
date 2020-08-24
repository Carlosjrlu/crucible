import { SYSTEM } from "../config/system.js";


export default class CrucibleItem extends Item {
  constructor(...args) {
    super(...args);

    /**
     * Prepare the configuration entry for this Item
     * @type {Object}
     */
    this.config = this.prepareConfig();

    // Re-prepare the Item data once the config is ready
    this.prepareData();
  }

  /* -------------------------------------------- */
  /*  Item Configuration
  /* -------------------------------------------- */

  /**
   * Prepare the Configuration object for this Item type.
   * This configuration does not change when the data changes
   */
  prepareConfig() {
    switch ( this.data.type ) {
      case "skill":
        return SYSTEM.skills.skills[this.data.data.skill] || {};
      case "talent":
        return "foo";
    }
  }

  /* -------------------------------------------- */
  /*  Item Preparation
  /* -------------------------------------------- */

  /**
   * Prepare the data object for this Item.
   * The prepared data will change as the underlying source data is updated
   */
  prepareData() {
    const data = this.data;
    switch ( this.data.type ) {
      case "armor":
        return this._prepareArmorData(data);
      case "skill":
        return this._prepareSkillData(data);
      case "talent":
        return "foo";
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare base data for Armor type Items
   * @param {object} data     The item data object
   * @private
   */
  _prepareArmorData(data) {
    const {armor, dodge} = data.data;
    const category = SYSTEM.ARMOR_CATEGORIES[data.data.category] || "unarmored";

    // Base Armor can be between zero and the maximum allowed for the category
    armor.base = Math.clamped(armor.base, category.minArmor, category.maxArmor);

    // Base Dodge is defined as (18 - base_armor) / 2, to a maximum of 8
    dodge.base = Math.min(Math.floor((18 - armor.base) / 2), 8);

    // Dodge Start is defined as base armor / 3
    dodge.start = Math.ceil(armor.base / 3);

    // Armor can have an enchantment bonus up to a maximum of 6
    armor.bonus = Math.clamped(armor.bonus, 0, 6);
  }

  /* -------------------------------------------- */

  /**
   * Prepare additional data for Skill type Items
   * @param data
   * @private
   */
  _prepareSkillData(data) {
    const skill = this.config || {};

    // Copy and merge skill data
    data.name = skill.name;
    data.img = skill.icon;
    data.category = skill.category;
    data.attributes = skill.attributes;

    // Skill rank
    let current = null;
    let next = null;
    data.ranks = duplicate(skill.ranks).map(r => {
      r.purchased = (r.rank > 0) && (r.rank <= data.data.rank);
      if ( r.rank === data.data.rank ) current = r;
      else if ( r.rank === data.data.rank + 1 ) next = r;
      return r;
    });
    data.currentRank = current;
    data.nextRank = next;

    // Skill progression paths
    let path = null;
    data.paths = duplicate(skill.paths).map(p => {
      p.active = p.id === data.data.path;
      if ( p.active ) path = p;
      return p;
    });
    data.path = path;
    return data;
  }

  /* -------------------------------------------- */
  /*  Dice Rolls                                  */
  /* -------------------------------------------- */

  roll({passive=false}={}) {
    if ( !this.isOwned ) return false;
    switch ( this.data.type ) {
      case "skill":
        this._rollSkillCheck({passive});
        break;
    }
  }

  /* -------------------------------------------- */

  _rollSkillCheck({passive=false}={}) {
    const formula = `${passive ? SYSTEM.dice.passiveCheck : SYSTEM.activeCheckFormula} + ${this.data.value}`;
    const roll = new Roll(formula).roll();
    const skillName = this.data.data.path ? `${this.name} (${this.data.path.name})` : this.name;
    return roll.toMessage({
      speaker: {actor: this.actor, user: game.user},
      flavor: passive ? `Passive ${skillName}` : `${skillName} Skill Check`
    });
  }
}