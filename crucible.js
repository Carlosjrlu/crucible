/**
 * Crucible (WIP) Game System
 * Author: Atropos
 * Software License: GNU GPLv3
 * Repository: https://gitlab.com/foundrynet/crucible
 */

// Import Modules
import { SYSTEM } from "./module/config/system.js";
import CrucibleActor from "./module/entities/actor.js";
import CrucibleItem from "./module/entities/item.js";
import HeroSheet from "./module/sheets/hero.js";
import SkillSheet from "./module/sheets/skill.js";

import { StandardCheck } from "./module/dice/rolls.js";
import { StandardCheckDialog } from "./module/dice/apps.js";


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Crucible Game System`);

  // Record Configuration Values
  CONFIG.SYSTEM = SYSTEM;
  CONFIG.Actor.entityClass = CrucibleActor;
  CONFIG.Item.entityClass = CrucibleItem;

  // Populate the system object
  game.system.dice = {
    StandardCheck
  };

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM.id, HeroSheet, {types: ["hero"], makeDefault: true});
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM.id, SkillSheet, {types: ["skill"], makeDefault: true});

  // Register Dice mechanics
  CONFIG.Dice.rolls["StandardCheck"] = StandardCheck;
});


/* -------------------------------------------- */
/*  Ready Hooks                                 */
/* -------------------------------------------- */

Hooks.once("ready", function() {

  // TODO: Prevent the creation of Items with certain types
  game.system.entityTypes.Item.splice(game.system.entityTypes.Item.findIndex(i => i === "skill"), 1);

  // Testing the dice roll
  let sc = new StandardCheck({
    actorId: game.actors.size ? game.actors.entities[0].id : null,
    type: "survival",
    dc: 23,
    ability: 7,
    skill: 4,
    rollMode: "blindroll"
  });
  sc.dialog.render(true);
});



/* -------------------------------------------- */
/*  Rendering Hooks                             */
/* -------------------------------------------- */


Hooks.on("renderChatMessage", (message, html, data) => {
  if ( message.isRoll ) {
    const rollType = message.getFlag(SYSTEM.id, "rollType");
    html.find(".message-content");
  }
});