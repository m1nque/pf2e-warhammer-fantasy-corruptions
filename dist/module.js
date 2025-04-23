// src/config.ts
var chaosGods = ["khorne", "nurgle", "tzeentch", "slaanesh"];
var config_default = {
  MODULE_ID: "CHAOS_CORRUPTION",
  MODULE_NAME: "pf2e-warhammer-fantasy-corruptions",
  MODULE_TITLE: "Chaos Corruption for Pathfinder second edition",
  chaosGods
};

// src/module.ts
function localize(key) {
  return game.i18n.localize(`${config_default.MODULE_ID}.${key}`);
}
Hooks.once("init", () => {
  console.log(`${config_default.MODULE_ID} | Initializing ${config_default.MODULE_NAME}`);
  CONFIG.debug.hooks = true;
  if (game.system.id !== "pf2e") {
    console.warn(`${config_default.MODULE_ID} | This module is only compatible with the PF2E system.`);
    return;
  }
});
export {
  localize
};
//# sourceMappingURL=module.js.map
