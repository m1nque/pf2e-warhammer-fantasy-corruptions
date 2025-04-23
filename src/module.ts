import config from './config';

/**
 * 로컬라이즈 헬퍼
 * @param key localization 키
 * @returns 로컬라이즈된 문자열
 */
export function localize(key: string): string {
  return game.i18n.localize(`${config.MODULE_ID}.${key}`);
}

/**
 * Initialize the module
 */
Hooks.once('init', () => {
  console.log(`${config.MODULE_ID} | Initializing ${config.MODULE_NAME}`);

  if (game.system.id !== 'pf2e') {
    console.warn(`${config.MODULE_ID} | This module is only compatible with the PF2E system.`);
    return;
  }

  // Register settings
  game.settings.register(config.MODULE_ID, 'setting1', {
    name: localize('settings.setting1.name'),
    hint: localize('settings.setting1.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
});