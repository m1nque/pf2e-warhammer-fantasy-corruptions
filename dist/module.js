// src/config.ts
var chaosGods = ["khorne", "nurgle", "tzeentch", "slaanesh"];
var defaultCorruptionDC = 15;
var config_default = {
  MODULE_ID: "pf2e-warhammer-fantasy-corruptions",
  MODULE_NAME: "Chaos Corruptions",
  MODULE_TITLE: "Chaos Corruption for Pathfinder second edition",
  defaultCorruptionDC,
  chaosGods
};

// src/hookEvents/corruptions.ts
var khorneCorruptionRoll = async (message) => {
  const context = message.getFlag("pf2e", "context");
  if (!context || context.type !== "attack-roll") return;
  const speaker = message.speaker;
  const actor = ChatMessage.getSpeakerActor(speaker);
  if (!actor) return;
  const khorneEffect = actor.items.find(
    (item) => item.system.slug === "chaos-corruptions-khorne-corruption"
  );
  if (!khorneEffect) return;
  console.log(`${config_default.MODULE_ID} | khorneEffect found`, khorneEffect);
  const corruptionLevel = khorneEffect.system?.badge?.value ?? 0;
  if (game.settings.get(config_default.MODULE_ID, "notifyChat")) {
    await khorneEffect.toMessage(void 0, { create: true });
  }
};
var nurgleCorruptionRoll = async (combatantPf2e, encounterPf2e) => {
  const actor = combatantPf2e.actor;
  if (!actor) return;
  const nurgleEffect = actor.items.find(
    (item) => item.system.slug === "chaos-corruptions-nurgle-corruption"
  );
  if (!nurgleEffect) return;
  const corruptionLevel = nurgleEffect.system?.badge?.value ?? 0;
  if (game.settings.get(config_default.MODULE_ID, "notifyChat")) {
    await nurgleEffect.toMessage(void 0, { create: true });
  }
};
var getAffectedAuras = (token) => {
  const tokenCenter = token.center;
  const inRangeAuras = [];
  for (const sourceToken of canvas.tokens.placeables) {
    if (token.id === sourceToken.id) continue;
    if (!sourceToken.document.auras) continue;
    const auras = sourceToken.document.auras;
    for (const [key, aura] of auras) {
      const distance = canvas.grid.measureDistance(
        sourceToken.center,
        tokenCenter
      );
      const radius = aura.radius ?? 0;
      if (distance <= radius) {
        inRangeAuras.push({
          from: sourceToken.name,
          auraSlug: aura.slug,
          distance,
          radius
        });
      }
    }
  }
  return inRangeAuras;
};
var checkCorruptionAuras = async (combatantPf2e, encounterPf2e) => {
  const corruptionSlugs = {
    "chaos-corruptions-chaos-undivided-aura": "chaos-corruptions-chaos-undivided-corruption",
    "chaos-corruptions-nurgle-aura": "chaos-corruptions-nurgle-corruption",
    "chaos-corruptions-khorne-aura": "chaos-corruptions-khorne-corruption",
    "chaos-corruptions-slaanesh-aura": "chaos-corruptions-slaanesh-corruption",
    "chaos-corruptions-tzeentch-aura": "chaos-corruptions-tzeentch-corruption"
  };
  if (!game.settings.get(config_default.MODULE_ID, "autoIncrease")) {
    return;
  }
  const actorToken = combatantPf2e.token;
  if (!actorToken) return;
  const affectedAuras = getAffectedAuras(actorToken);
  console.log(`${config_default.MODULE_ID} | affectedAuras`, affectedAuras);
  if (affectedAuras.length === 0) return;
  for (const { auraSlug, from } of affectedAuras) {
    const corruptionSlug = corruptionSlugs[auraSlug];
    if (!corruptionSlug) {
      console.log(`${config_default.MODULE_ID} | affectedAuras`, affectedAuras);
      continue;
    }
    const corruptionEffect = actorToken.actor.items.find(
      (item) => item.system.slug === corruptionSlug
    );
    if (!corruptionEffect) {
      console.log(
        `${config_default.MODULE_ID} | ${from}'s ${auraSlug} aura has no corresponding corruption effect`
      );
      continue;
    }
    const currentValue = corruptionEffect.system.badge.value;
    const maxValue = corruptionEffect.system.badge.max;
    if (currentValue >= maxValue) {
      console.log(
        `${config_default.MODULE_ID} | ${from}'s ${auraSlug} corruption effect is already at maximum`
      );
      continue;
    }
    await corruptionEffect.update({
      "system.badge.value": corruptionEffect.system.badge.value + 1
    });
  }
};

// src/module.ts
function localize(key) {
  return game.i18n.localize(`${config_default.MODULE_ID}.${key}`);
}
Hooks.once("init", () => {
  console.log(`${config_default.MODULE_ID} | Initializing ${config_default.MODULE_NAME}`);
  game.settings.register(config_default.MODULE_ID, "notifyChat", {
    name: localize("settings.notifyChat.name"),
    hint: localize("settings.notifyChat.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(config_default.MODULE_ID, "autoIncrease", {
    name: localize("settings.autoIncrease.name"),
    hint: localize("settings.autoIncrease.hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
  CONFIG.debug.hooks = true;
  if (game.system.id !== "pf2e") {
    console.warn(
      `${config_default.MODULE_NAME} | This module is only compatible with the PF2E system.`
    );
    return;
  }
  libWrapper.register(
    config_default.MODULE_ID,
    "TextEditor.enrichHTML",
    async function(wrapped, content, options) {
      const sceneDc = canvas.scene?.getFlag(config_default.MODULE_ID, "corruptionDC") ?? 15;
      content = content.replace(
        /@ChaosCheck\[(.*?)\]\{(.*?)\}/g,
        (match, params, label) => {
          const hasDC = params.includes("dc:");
          let newParams = hasDC ? params : `${params}|dc:${sceneDc}`;
          return `@Check[${newParams}]{${label}}`;
        }
      );
      return await wrapped(content, options);
    },
    "WRAPPER"
    // 래퍼 타입 (PF2e 패치 이후 실행)
  );
  initializeHookEvents();
});
function initializeHookEvents() {
  Hooks.on("createChatMessage", khorneCorruptionRoll);
  Hooks.on("pf2e.startTurn", nurgleCorruptionRoll);
  Hooks.on("pf2e.startTurn", checkCorruptionAuras);
}
var corruptionDcFlag = `flags.${config_default.MODULE_ID}.corruptionDC`;
Hooks.on("renderSceneConfig", (app, html, data) => {
  const sceneOptionLabel = localize("scene.corruptionDC.label");
  const sceneOptionHint = localize("scene.corruptionDC.hint");
  const dcOption = `<div class="form-group">
        <label for="${corruptionDcFlag}">${sceneOptionLabel}</label>
        <div class="form-fields">
          <input type="number" id="${corruptionDcFlag}"
            name="${corruptionDcFlag}" value="${app.object.getFlag(config_default.MODULE_ID, "corruptionDC") ?? defaultCorruptionDC}" placeholder="Defult is 15">
        </div>
        <p class="hint">${sceneOptionHint}</p>
    </div>`;
  html.find('section.tab[data-tab="pf2e"]').append(dcOption);
});
Hooks.on("preUpdateScene", (scene, updateData) => {
  console.log(`${config_default.MODULE_ID} | preUpdateScene`, scene, updateData);
  const dc = foundry.utils.getProperty(updateData, corruptionDcFlag);
  if (dc !== void 0) {
    foundry.utils.getProperty(scene, corruptionDcFlag, dc);
  }
});
export {
  localize
};
//# sourceMappingURL=module.js.map
