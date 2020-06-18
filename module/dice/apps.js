import { SYSTEM } from "../config/system.js";


export class StandardCheckDialog extends FormApplication {
  constructor(object, options) {
    super(object, options);
  }

	/* -------------------------------------------- */

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    template: `systems/${SYSTEM.id}/templates/dice/standard-check.html`,
      classes: [SYSTEM.id, "roll"],
      width: 520,
      submitOnChange: true,
      closeOnSubmit: false
    });
	}

  /* -------------------------------------------- */

  /** @override */
  get title() {
    const type = this.object.data.type;
    if ( type in CONFIG.SYSTEM.skills.skills ) {
      const skill = CONFIG.SYSTEM.skills.skills[type];
      return `${skill.name} Skill Check`;
    }
    return "Generic Dice Check";
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = duplicate(this.object.data);
    const dc = this._getDifficulty(data.dc);
    const dice = this.object.pool.map(f => `d${f}`);
    return mergeObject(data, {
      actors: game.user.isGM ? this._getPlayerActors() : [],
      dcLabel: dc.label,
      dice: dice,
      difficulties: SYSTEM.dice.checkDifficulties,
      isGM: game.user.isGM,
      rollModes: CONFIG.Dice.rollModes,
      tier: dc.tier,
      types: [
        {
          label: "Check Type",
          options: {
            "": {name: "Generic"}
          }
        },
        {
          label: "Combat",
          options: {
            attack: {name: "Attack"},
            endurance: {name: "Endurance"},
            evasion: {name: "Evasion"},
            resolve: {name: "Resolve"}
          }
        },
        {
          label: "Skills",
          options: CONFIG.SYSTEM.skills.skills
        }
      ]
    });
  }

	/* -------------------------------------------- */

  /**
   * Get the text label for a dice roll DC
   * @param {number} dc
   * @return {object}
   * @private
   */
  _getDifficulty(dc) {
    let label = "";
    let tier = 0;
    for ( let [d, l] of Object.entries(SYSTEM.dice.checkDifficulties) ) {
      if ( dc >= d ) {
        tier = d;
        label = `${l} (DC ${d})`;
      }
      else break;
    }
    return {dc, label, tier};
  }

	/* -------------------------------------------- */

  /**
   * Get an array of Actors which are owned by a player
   * @private
   */
  _getPlayerActors() {
    return game.actors.entities.filter(a => {
      return Math.max(...Object.values(a.data.permission)) >= ENTITY_PERMISSIONS.OWNER;
    });
  }

	/* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    html.find('[data-action]').click(this._onClickAction.bind(this));
    html.find('label[data-action]').contextmenu(this._onClickAction.bind(this));
    html.find('select[name="tier"]').change(this._onChangeDifficultyTier.bind(this));
    super.activateListeners(html);
  }

	/* -------------------------------------------- */

  _onClickAction(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const check = this.object;
    switch ( action ) {
      case "boon":
        const nBoons = check.data.boons + (event.type === "contextmenu" ? -1 : 1);
        if ( nBoons <= SYSTEM.dice.MAX_BOONS ) {
          this._updateObject(event, {boons: nBoons});
        }
        break;
      case "bane":
        const nBanes = check.data.banes + (event.type === "contextmenu" ? -1 : 1);
        if ( nBanes <= SYSTEM.dice.MAX_BANES ) {
          this._updateObject(event, {banes: nBanes});
        }
        break;
      case "roll":
        const rollMode = this.element.find('select[name="rollMode"]').val();
        const roll = this.object.reroll();
        roll.toMessage();
        break;
    }
  }

	/* -------------------------------------------- */

  _onChangeDifficultyTier(event) {
    event.preventDefault();
    event.stopPropagation();
    return this._updateObject(event, {dc: parseInt(event.target.value)});
  }

	/* -------------------------------------------- */

  _updateObject(event, formData) {
    this.object.initialize(formData);
    this.render();
  }
}