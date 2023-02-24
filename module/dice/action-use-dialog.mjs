import {SYSTEM} from "../config/system.js";
import StandardCheckDialog from "./standard-check-dialog.js";

/**
 * Prompt the user to activate an action which may involve the rolling of a dice pool.
 * @extends {StandardCheckDialog}
 */
export default class ActionUseDialog extends StandardCheckDialog {

  /** @inheritdoc */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
	    template: `systems/${SYSTEM.id}/templates/dice/action-use-dialog.html`,
      classes: [SYSTEM.id, "sheet", "roll"],
      width: 360,
      submitOnChange: true,
      closeOnSubmit: false
    });
	}

  /* -------------------------------------------- */

  /**
   * The Action being performed
   * @type {CrucibleAction}
   */
  get action() {
    return this.options.action;
  }

  /* -------------------------------------------- */

  /** @override */
  get title() {
    const {actor, action} = this.options;
    return `[${actor.name}] ${action.name}`
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();
    const {actor, action, targets} = this.options;
    const tags = this._getTags();
    return foundry.utils.mergeObject(context, {
      action: action,
      actor: actor,
      activationTags: tags.activation,
      actionTags: tags.action,
      hasActionTags: !foundry.utils.isEmpty(tags.action),
      hasContextTags: !foundry.utils.isEmpty(action.usage.context?.tags),
      hasDice: action.usage.context.hasDice ?? false,
      targets: targets
    });
  }

  /* -------------------------------------------- */

  /**
   * Get the tags that apply to this dialog.
   * @returns {ActionTags}
   * @protected
   */
  _getTags() {
    return this.action.getTags();
  }

  /* -------------------------------------------- */

  /** @override */
  _onSubmit(html) {
    const form = html.querySelector("form");
    const {boons, banes} = (new FormDataExtended(form, {readonly: true})).object;
    Object.assign(this.action.usage.bonuses, {boons, banes});
    return this.action;
  }
}
