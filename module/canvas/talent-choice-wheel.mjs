import CrucibleTalentTreeTalent from "./talent-tree-talent.mjs";

/**
 * A canvas UI element which displays a choice wheel for a talent tree node.
 * Only one choice wheel is displayed at a given time. The wheel is a singleton at canvas.tree.wheel.
 */
export default class CrucibleTalentChoiceWheel extends PIXI.Container {
  constructor() {
    super();

    /**
     * Background graphics for the wheel
     * @type {PIXI.Graphics}
     */
    this.bg = this.addChild(new PIXI.Graphics());

    /**
     * Talents available within this wheel
     * @type {PIXI.Container}
     */
    this.talents = this.addChild(new PIXI.Container());
  }

  /* -------------------------------------------- */

  /**
   * The node which the wheel is currently bound to, or null
   * @type {CrucibleTalentTreeNode|null}
   */
  node = null;

  /* -------------------------------------------- */

  /**
   * Activate the talent tree choice wheel for a given node
   * @param {CrucibleTalentTreeNode} node
   * @returns {Promise<void>}
   */
  async activate(node) {
    this.node = node;
    this.position.set(node.x, node.y);
    this.#drawBackground();
    await this.#drawTalents();
    this.visible = true;
  }

  /* -------------------------------------------- */

  /**
   * Activate the talent tree choice wheel.
   */
  deactivate() {
    this.visible = false;
    this.node = null;
    this.talents.removeChildren().forEach(t => t.destroy());
  }

  /* -------------------------------------------- */

  /**
   * Draw the wheel background.
   */
  #drawBackground() {
    this.bg.clear()
      .lineStyle({color: this.node.node.color, width: 4})
      .beginFill(0x000000, 0.9)
      .drawCircle(0, 0, 100)
      .endFill();

    // Set line style for later connecting lines
    this.bg.lineStyle({color: 0x444444, width: 4});
  }

  /* -------------------------------------------- */

  /**
   * Draw TalentIcon containers to the wheel
   * @returns {Promise<void>}
   */
  async #drawTalents() {
    const talents = this.node.node.talents;
    const tier1 = new PIXI.Circle(0, 0, 100);
    const a = 2 * Math.PI / talents.size;

    // Iterate over talents
    let i = 0;
    for ( const talent of talents ) {

      // Create the icon
      const icon = new CrucibleTalentTreeTalent(this.node, talent);
      const position = tier1.pointAtAngle((i * a) - (Math.PI / 2));
      await icon.draw({position});
      this.talents.addChild(icon);
      i++;

      // Draw connecting line
      this.bg.moveTo(0, 0).lineTo(icon.x, icon.y);
    }
  }
}
