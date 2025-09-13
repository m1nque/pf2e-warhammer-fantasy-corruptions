import config from '../config';

/**
 * 색상과 알파값을 기반으로 RGBA 색상 문자열을 생성합니다
 * @param hexColor 16진수 색상 코드 (예: #FF2400)
 * @param alpha 알파값 (0-1 사이)
 * @returns RGBA 색상 문자열
 */
const hexToRgba = (hexColor: string, alpha: number): string => {
  // 색상 코드에서 # 제거하고 RGB 값 추출
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 오염 유형별 색상 정의
 */
const CORRUPTION_COLORS = {
  'chaos-corruptions-khorne-corruption': '#FF2400', // 코른
  'chaos-corruptions-nurgle-corruption': '#324C09', // 너글
  'chaos-corruptions-tzeentch-corruption': '#8A2BE2', // 젠취
  'chaos-corruptions-slaanesh-corruption': '#DA70D6' // 슬라네쉬
};

/**
 * 선택된 토큰의 오염도에 따라 시각적 효과를 적용합니다
 * @param token 선택된 토큰
 * @param controlled 토큰이 선택되었는지 여부
 */
export const updateCorruptionVisuals = (
  token: TokenPF2e,
  controlled: boolean
): void => {
  const corruptionLayer = document.getElementById('corruption-layer');

  // 선택되지 않았거나 레이어가 없으면 효과 제거
  if (!controlled || !corruptionLayer) {
    corruptionLayer?.style.removeProperty('background-color');
    return;
  }

  const actor = token.actor;
  if (!actor) return;

  // 가장 높은 오염도를 찾습니다
  let highestCorruption: { slug: string; color: string; level: number } | null =
    null;
  let highestLevel = 0;

  for (const [slug, color] of Object.entries(CORRUPTION_COLORS)) {
    const effect = actor.items.find(
      (item: ItemPF2e) => item.system.slug === slug
    );
    if (effect && effect.system?.badge?.value) {
      const level = effect.system.badge.value;
      if (level > highestLevel) {
        highestLevel = level;
        highestCorruption = { slug, color, level };
      }
    }
  }

  // 오염 효과 적용
  if (highestCorruption && highestCorruption.level > 0) {
    // 단계에 따라 알파값 결정 (0.1 * 단계)
    const alpha = Math.min(0.1 * highestCorruption.level, 0.7); // 최대 0.7로 제한
    const bgColor = hexToRgba(highestCorruption.color, alpha);

    corruptionLayer.style.backgroundColor = bgColor;
    console.log(
      `${config.MODULE_ID} | Applied corruption visual: ${highestCorruption.slug} level ${highestCorruption.level}`
    );
  } else {
    // 오염 효과가 없거나 레벨이 0인 경우 배경색 제거
    corruptionLayer.style.removeProperty('background-color');
    console.log(`${config.MODULE_ID} | Removed corruption visual effect`);
  }
};

/**
 * FoundryVTT 초기화 후 오염도 시각화 레이어를 생성합니다
 */
export const initCorruptionLayer = (): void => {
  const hud = document.getElementById('hud');
  if (!hud) return;

  // 이미 레이어가 있으면 생성하지 않음
  if (hud.querySelector('#corruption-layer')) return;

  const corruptionLayer = document.createElement('div');
  corruptionLayer.id = 'corruption-layer';
  corruptionLayer.style.position = 'absolute';
  corruptionLayer.style.top = '0';
  corruptionLayer.style.left = '0';
  corruptionLayer.style.width = '100%';
  corruptionLayer.style.height = '100%';
  corruptionLayer.style.pointerEvents = 'none';
  corruptionLayer.style.zIndex = '60'; // hud 내에서 적절한 z-index 설정
  corruptionLayer.style.transition = 'background-color 0.5s ease';

  console.log(`${config.MODULE_ID} | Creating corruption visualization layer`);
  hud.appendChild(corruptionLayer);
};
