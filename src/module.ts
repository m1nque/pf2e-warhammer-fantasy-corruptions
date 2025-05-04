import config from './config';
import { defaultCorruptionDC } from './config';
import {
  checkCorruptionAuras,
  khorneCorruptionRoll,
  nurgleCorruptionRoll
} from './hookEvents/corruptions';

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

  // game.settings.register(config.MODULE_ID, 'debug', {
  //   name: localize('settings.debug.name'),
  //   hint: localize('settings.debug.hint'),
  //   scope: 'client',
  //   config: true,
  //   type: Boolean,
  //   default: false
  // });

  game.settings.register(config.MODULE_ID, 'notifyChat', {
    name: localize('settings.notifyChat.name'),
    hint: localize('settings.notifyChat.hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(config.MODULE_ID, 'autoIncrease', {
    name: localize('settings.autoIncrease.name'),
    hint: localize('settings.autoIncrease.hint'),
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });

  // if (game.settings.get(config.MODULE_ID, 'notifyChat')) {
  //   CONFIG.debug.hooks = true;
  // }
  CONFIG.debug.hooks = true;

  if (game.system.id !== 'pf2e') {
    console.warn(
      `${config.MODULE_NAME} | This module is only compatible with the PF2E system.`
    );
    return;
  }

  libWrapper.register(
    config.MODULE_ID,
    'TextEditor.enrichHTML',
    async function (wrapped, content, options) {
      // 래퍼 함수
      const sceneDc =
        canvas.scene?.getFlag(config.MODULE_ID, 'corruptionDC') ?? 15; //canvas.scene?.getFlag(pf2e-warhammer-fantasy-corruptions, 'corruptionDC')
      content = content.replace(
        /@ChaosCheck\[(.*?)\]\{(.*?)\}/g,
        (match, params, label) => {
          // params에 dc가 이미 있으면 덮어쓰지 않음
          const hasDC = params.includes('dc:');
          let newParams = hasDC ? params : `${params}|dc:${sceneDc}`;
          return `@Check[${newParams}]{${label}}`;
        }
      );

      // console.log('Patched @ChaosCheck', content, options);

      return await wrapped(content, options); // 원본 메서드 호출
    },
    'WRAPPER' // 래퍼 타입 (PF2e 패치 이후 실행)
  );

  initializeHookEvents();

  // TODO Register settings
});

function initializeHookEvents() {
  Hooks.on('createChatMessage', khorneCorruptionRoll);
  Hooks.on('pf2e.startTurn', nurgleCorruptionRoll);
  Hooks.on('pf2e.startTurn', checkCorruptionAuras);
}

const corruptionDcFlag = `flags.${config.MODULE_ID}.corruptionDC`;

Hooks.on('renderSceneConfig', (app, html, data) => {
  const sceneOptionLabel = localize('scene.corruptionDC.label');
  const sceneOptionHint = localize('scene.corruptionDC.hint');

  const dcOption = `<div class="form-group">
        <label for="${corruptionDcFlag}">${sceneOptionLabel}</label>
        <div class="form-fields">
          <input type="number" id="${corruptionDcFlag}"
            name="${corruptionDcFlag}" value="${app.object.getFlag(config.MODULE_ID, 'corruptionDC') ?? defaultCorruptionDC}" placeholder="Defult is 15">
        </div>
        <p class="hint">${sceneOptionHint}</p>
    </div>`;

  html.find('section.tab[data-tab="pf2e"]').append(dcOption);
});

Hooks.on('preUpdateScene', (scene, updateData) => {
  console.log(`${config.MODULE_ID} | preUpdateScene`, scene, updateData);

  const dc = foundry.utils.getProperty(updateData, corruptionDcFlag);
  if (dc !== undefined) {
    // DC 값을 실제 Scene 데이터에 저장
    foundry.utils.getProperty(scene, corruptionDcFlag, dc);
  }
});

// // 아이템 시트 렌더링 시 토큰 치환
// Hooks.on('renderItemSheet', (app, html, data) => {
//   const dc = canvas.scene?.getFlag(config.MODULE_ID, 'corruptionDC') ?? 15;
//   html[0].querySelectorAll('.item-description').forEach((desc) => {
//     desc.innerHTML = desc.innerHTML.replace(/@sceneCorruptionDC/g, dc);
//   });
// });

// // 채팅 메시지 생성 전 토큰 치환
// Hooks.on('preCreateChatMessage', (message, options, userId) => {
//   const dc = canvas.scene?.getFlag(config.MODULE_ID, 'corruptionDC') ?? 15;
//   if (message.content.includes('@sceneCorruptionDc')) {
//     message.content = message.content.replace(/@sceneCorruptionDc/g, dc);
//   }
//   return message;
// });
