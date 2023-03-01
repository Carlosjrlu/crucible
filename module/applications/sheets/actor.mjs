import { SYSTEM } from "../../config/system.js";

/**
 * A common actor sheet class shared by both Hero and Adversary types.
 */
export default class CrucibleActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 760,
      height: 720,
      classes: [SYSTEM.id, "sheet", "actor", this.actorType],
      template: `systems/${SYSTEM.id}/templates/sheets/${this.actorType}.hbs`,
      resizable: false,
      tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "attributes"}],
      scrollY: []
    });
  }

  /**
   * The type of Actor rendered using this sheet.
   * @type {string}
   */
  static actorType = "hero";

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {

    // Start with some elements from the basic DocumentSheet
    const context = await DocumentSheet.prototype.getData.call(this, options);
    const a = context.actor = context.document;
    const s = context.source = context.data;

    // Abilities, Defenses, Resources, and Resistances
    context.abilityScores = this.#formatAbilities(a.system.abilities);
    context.saveDefenses = this.#formatSaveDefenses(a.system.defenses);
    context.resources = this.#formatResources(a.system.resources);
    context.resistances = this.#formatResistances(a.system.resistances);

    // Owned Items
    context.items = this.#formatItems(a.items);

    // Equipment
    const armor = a.equipment.armor;
    const {mainhand: mh, offhand: oh, twoHanded: th} = a.equipment.weapons;
    context.armorCategory = SYSTEM.ARMOR.CATEGORIES[armor.system.category].label;
    context.armorCategory = SYSTEM.ARMOR.CATEGORIES[armor.system.category].label;
    context.featuredEquipment = [{name: mh.name, img: mh.img, tag: [mh.getTags().damage]}];
    if ( !th ) context.featuredEquipment.push({name: oh.name, img: oh.img, tag: [oh.getTags().damage]});
    context.featuredEquipment.push({name: armor.name, img: armor.img, tag: armor.getTags().armor});

    // Actions
    context.actions = Object.values(context.actor.actions).map(a => {
      const tags = a.getTags().activation;
      return {id: a.id, name: a.name, img: a.img, tags, totalCost: a.cost.action + a.cost.focus}
    }).sort((a, b) => (a.totalCost - b.totalCost) || (a.name.localeCompare(b.name)));

    // Spellcraft
    context.grimoire = this.#formatGrimoire();

    // Active Effects
    context.effects = this.#formatEffects();

    // HTML Biography
    context.biography = {};
    context.biography.public = await TextEditor.enrichHTML(s.system.details.biography.public, {
      secrets: a.isOwner,
      async: true,
      relativeTo: a
    });
    context.biography.private = await TextEditor.enrichHTML(s.system.details.biography.private, {
      secrets: a.isOwner,
      async: true,
      relativeTo: a
    });

    // Creation Tasks
    context.incomplete = {}
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Format ability scores for display on the Actor sheet.
   * @param {object} abilities
   * @return {object[]}
   */
  #formatAbilities(abilities) {
    return Object.entries(SYSTEM.ABILITIES).map(e => {
      let [a, ability] = e;
      const attr = foundry.utils.deepClone(ability);
      attr.id = a;
      attr.value = abilities[a].value;
      return attr;
    });
  }

  /* -------------------------------------------- */

  /**
   * Format magic defenses for display in the sheet.
   * @param {object} defenses     Prepared Actor system defenses
   * @returns {object[]}          A formatted array of save defenses
   */
  #formatSaveDefenses(defenses) {
    const formatted = [];
    for ( const [id, defense] of Object.entries(SYSTEM.DEFENSES) ) {
      if ( defense.type !== "save" ) continue;
      const d = foundry.utils.mergeObject(defense, defenses[id]);
      d.id = id;
      formatted.push(d);
    }
    return formatted;
  }

  /* -------------------------------------------- */

  /**
   * Format the display of resource attributes on the actor sheet
   * @param {object} resources       The ActorData.system.resources object
   */
  #formatResources(resources) {
    return Object.entries(resources).map(([id, resource]) => {
      const r = foundry.utils.mergeObject(SYSTEM.RESOURCES[id], resource, {inplace: false});
      r.id = id;
      r.pct = Math.round(r.value * 100 / r.max);

      // Determine resource bar color
      const p = r.pct / 100;
      const c0 = r.color.low.rgb;
      const c1 = r.color.high.rgb;
      const bg = c0.map(c => c * 0.25 * 255);
      const fill = c1.map((c, i) => ((c * p) + (c0[i] * (1-p))) * 255);
      r.color.bg = `rgb(${bg.join(",")})`;
      r.color.fill = `rgb(${fill.join(",")})`;
      return r;
    });
  }

  /* -------------------------------------------- */

  /**
   * Organize resistances data for rendering
   * @param {object} resistances    The Actor's resistances data
   * @return {object}               Resistances data organized by category
   */
  #formatResistances(resistances) {
    const categories = foundry.utils.deepClone(SYSTEM.DAMAGE_CATEGORIES);
    return Object.entries(resistances).reduce((categories, e) => {

      // Merge resistance data for rendering
      let [id, r] = e;
      const resist = foundry.utils.mergeObject(r, SYSTEM.DAMAGE_TYPES[id]);

      // Add the resistance to its category
      const cat = categories[resist.type];
      cat.resists = cat.resists || {};
      cat.resists[id] = resist;
      return categories;
    }, categories);
  }

  /* -------------------------------------------- */

  /**
   * Structure owned items for display on the actor sheet.
   * @param {CrucibleItem[]} items        The array of owned items
   */
  #formatItems(items) {

    // Define placeholder structure
    const sections = {
      talents: {
        active: {
          label: "Active Abilities",
          items: []
        },
        passive: {
          label: "Passive Talents",
          items: []
        },
        spell: {
          label: "Spellcraft Talents",
          items: []
        }
      },
      inventory: {
        equipment: {
          label: "Equipment",
          items: []
        },
        consumables: {
          label: "Consumables",
          items: []
        },
        backpack: {
          label: "Backpack",
          items: []
        }
      }
    };

    // Iterate over items and organize them
    for ( let i of items ) {
      const d = i.toObject();
      d.showStack = d.system?.quantity && (d.system.quantity !== 1);
      switch(d.type) {
        case "armor":
        case "weapon":
          d.tags = i.getTags();
          d.cssClass = [d.system.equipped ? "equipped" : "unequipped"];
          if ( d.system.equipped ) sections.inventory.equipment.items.push(d);
          else sections.inventory.backpack.items.push(d);
          break;
        case "talent":
          d.tags = {};
          const action = i.actions.at(0);
          const spellComp = i.system.rune || i.system.gesture || i.system.inflection;
          if ( action ) {
            const tags = action.getTags();
            d.tags = Object.assign({}, tags.action, tags.activation);
            sections.talents.active.items.push(d);
          }
          else if ( spellComp ) sections.talents.spell.items.push(d);
          else sections.talents.passive.items.push(d);
          break;
      }
    }

    // Sort each array
    for ( let section of Object.values(sections) ) {
      for ( let heading of Object.values(section) ) {
        heading.items.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    // Return the prepared sections
    return sections;
  }

  /* -------------------------------------------- */

  /**
   * Format categories of the grimoire tab.
   * @returns {{
   *  runes: {label: string, known: Set<CrucibleRune>},
   *  inflections: {label: string, known: Set<CrucibleInflection>},
   *  gestures: {label: string, known: Set<CrucibleGesture>}
   * }}
   */
  #formatGrimoire() {
    const grimoire = {
      runes: {label: game.i18n.localize("SPELL.ComponentRune")},
      gestures: {label: game.i18n.localize("SPELL.ComponentGesture")},
      inflections: {label: game.i18n.localize("SPELL.ComponentInflection")}
    }
    for ( const [k, v] of Object.entries(this.actor.grimoire) ) {
      grimoire[k].known = v;
    }
    return grimoire;
  }

  /* -------------------------------------------- */

  /**
   * Format ActiveEffect data required for rendering the sheet
   * @returns {object[]}
   */
  #formatEffects() {
    return this.actor.effects.map(effect => {
      const {startRound, rounds} = effect.duration;
      const tags = {};
      if ( rounds ) tags.duration = game.combat?.round ? (startRound + rounds - game.combat.round) : rounds;
      else tags.duration = "∞";
      return {
        id: effect.id,
        icon: effect.icon,
        label: effect.label,
        tags: tags
      }
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("[data-action]").click(this._onClickControl.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle click events on a sheet control button.
   * @param {PointerEvent} event   The originating click event
   * @protected
   */
  async _onClickControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    switch ( a.dataset.action ) {
      case "effectDelete":
        this.#onEffectDelete(a);
        break;
      case "effectEdit":
        this.#onEffectEdit(a);
        break;
      case "itemDelete":
        this.#onItemDelete(a);
        break;
      case "itemEdit":
        this.#onItemEdit(a);
        break;
      case "itemEquip":
        this.#onItemEquip(a);
        break;
      case "useAction":
        await this.actor.useAction(a.closest(".action").dataset.actionId);
        break;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an ActiveEffect within the Actor sheet.
   * @param {HTMLLinkElement} button    The clicked button element
   */
  #onEffectDelete(button) {
    const li = button.closest("[data-effect-id]");
    const effect = this.actor.effects.get(li.dataset.effectId);
    effect?.deleteDialog();
  }

  /* -------------------------------------------- */

  /**
   * Handle editing an ActiveEffect within the Actor sheet.
   * @param {HTMLLinkElement} button    The clicked button element
   */
  #onEffectEdit(button) {
    const li = button.closest("[data-effect-id]");
    const effect = this.actor.effects.get(li.dataset.effectId);
    effect?.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an Owned Item from the Actor
   * @param {HTMLLinkElement} button
   */
  #onItemDelete(button) {
    const li = button.closest("[data-item-id]");
    const item = this.actor.items.get(li.dataset.itemId);
    return item?.deleteDialog();
  }

  /* -------------------------------------------- */

  /**
   * Handle editing an Owned Item on the Actor
   * @param {HTMLLinkElement} button
   */
  #onItemEdit(button) {
    const li = button.closest("[data-item-id]");
    const item = this.actor.items.get(li.dataset.itemId);
    return item?.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Toggle the equipped state of an Owned Item on the Actor
   * @param {HTMLLinkElement} button
   */
  #onItemEquip(button) {
    const li = button.closest("[data-item-id]");
    const item = this.actor.items.get(li.dataset.itemId);
    if ( !item ) return;
    switch ( item.type ) {
      case "armor":
        return this.actor.equipArmor({
          itemId: item.id,
          equipped: !item.system.equipped
        });
      case "weapon":
        return this.actor.equipWeapon({
          itemId: item.id,
          equipped: !item.system.equipped
        });
    }
  }
}

