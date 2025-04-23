// src/config.ts
var chaosGods = ["khorne", "nurgle", "tzeentch", "slaanesh"];
var config_default = {
  MODULE_ID: "CHAOS_CORRUPTION",
  MODULE_NAME: "Chaos Corruption",
  MODULE_TITLE: "Chaos Corruption for PF2E",
  chaosGods
};

// src/module.ts
function localize(key) {
  return game.i18n.localize(`${config_default.MODULE_ID}.${key}`);
}
Hooks.once("init", () => {
  console.log(`${config_default.MODULE_ID} | Initializing ${config_default.MODULE_NAME}`);
  if (game.system.id !== "pf2e") {
    console.warn(`${config_default.MODULE_ID} | This module is only compatible with the PF2E system.`);
    return;
  }
  game.settings.register(config_default.MODULE_ID, "setting1", {
    name: localize("settings.setting1.name"),
    hint: localize("settings.setting1.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
});
export {
  localize
};
//# sourceMappingURL=module.js.map
