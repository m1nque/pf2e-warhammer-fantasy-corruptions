import config from './config';
import { defaultCorruptionDC } from './config';
import {
  checkCorruptionAuras,
  khorneCorruptionRoll,
  nurgleCorruptionRoll
} from './hookEvents/corruptions';
import {
  initCorruptionLayer,
  updateCorruptionVisuals
} from './hookEvents/scene';

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
  // 디버그 모드 활성화 (FoundryVTT v13에서는 전역 CONFIG 객체를 통해 접근)
  if (typeof CONFIG !== 'undefined') {
    CONFIG.debug.hooks = true;
  }

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
        canvas.scene?.getFlag(config.MODULE_ID, 'corruptionDC') ?? 17; //canvas.scene?.getFlag(pf2e-warhammer-fantasy-corruptions, 'corruptionDC')
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

/**
 * Babele 번역 설정 초기화
 */
function initializeBabeleTranslation() {
  if (typeof Babele !== 'undefined') {
    console.log(
      `${config.MODULE_ID} | Initializing Babele translation support`
    );

    // 컴팬디움 번역 등록
    Babele.get().register({
      module: config.MODULE_ID,
      lang: game.i18n.lang,
      dir: 'lang'
    });

    // 팩별 번역 설정
    ['chaos-conditions', 'chaos-auras', 'chaos-feats'].forEach((packName) => {
      const pack = `${config.MODULE_ID}.${packName}`;
      Babele.get().registerConverters(
        {
          convertItem: (item, mapping) => {
            // 아이템 이름 및 설명 번역
            if (mapping.name) item.name = mapping.name;
            if (mapping.description)
              item.system.description.value = mapping.description;

            // 특성, 레벨 등 기타 필드 번역
            if (mapping.traits) {
              try {
                const traits = JSON.parse(mapping.traits);
                if (traits.value) item.system.traits.value = traits.value;
              } catch (e) {
                console.error(
                  `${config.MODULE_ID} | Error parsing traits for ${item.name}:`,
                  e
                );
              }
            }

            return item;
          }
        },
        pack
      );
    });
  } else {
    console.warn(
      `${config.MODULE_ID} | Babele module not found. Compendium translation disabled.`
    );
  }
}

function initializeHookEvents() {
  // Hooks.on('createChatMessage', khorneCorruptionRoll);
  // Hooks.on('pf2e.startTurn', nurgleCorruptionRoll);
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
//   const dc = canvas.scene?.getFlag(config.MODULE_ID, 'corruptionDC') ?? 17;
//   html[0].querySelectorAll('.item-description').forEach((desc) => {
//     desc.innerHTML = desc.innerHTML.replace(/@sceneCorruptionDC/g, dc);
//   });
// });

// // 채팅 메시지 생성 전 토큰 치환
// Hooks.on('preCreateChatMessage', (message, options, userId) => {
//   const dc = canvas.scene?.getFlag(config.MODULE_ID, 'corruptionDC') ?? 17;
//   if (message.content.includes('@sceneCorruptionDc')) {
//     message.content = message.content.replace(/@sceneCorruptionDc/g, dc);
//   }
//   return message;
// });

// 씬이 로드될 때 오염도 시각화 레이어 생성
Hooks.once('canvasReady', initCorruptionLayer);

// 게임이 준비되면 Babele 번역 초기화
Hooks.once('ready', () => {
  console.log(`${config.MODULE_ID} | Game is ready, initializing translations`);

  // Babele 모듈 초기화
  if (game.modules.get('babele')?.active) {
    // initializeBabeleTranslation();
  }
});

// 토큰 선택 시 오염도 시각화 업데이트
Hooks.on('controlToken', (token, controlled) => {
  updateCorruptionVisuals(token, controlled);
});

// 아이템 업데이트 시 오염도 시각화 업데이트
Hooks.on('updateItem', (item, changes, options, userId) => {
  // badge 값이 변경되었는지 확인
  if (changes.system?.badge?.value !== undefined) {
    // 오염 관련 아이템인지 확인
    const isCorruptionItem =
      item.system?.slug?.includes('chaos-corruptions') &&
      item.system?.slug?.includes('corruption');

    if (isCorruptionItem) {
      // 아이템이 속한 액터 찾기
      const actor = item.parent;
      if (!actor) return;

      // 액터의 토큰 찾기
      const tokens = canvas.tokens.placeables.filter(
        (t) => t.actor?.id === actor.id
      );

      // 각 토큰에 대해 선택 상태 확인 후 시각화 업데이트
      tokens.forEach((token) => {
        if (token.controlled) {
          console.log(
            `${config.MODULE_ID} | Updating corruption visuals for ${token.name} due to badge change`
          );
          updateCorruptionVisuals(token, true);
        }
      });
    }
  }
});
