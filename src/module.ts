import '@illandril/foundryvtt-types';

// 모듈 메타정보
export const MODULE_ID = "pf2e-warhammer-fantasy-corruptions";
export const MODULE_NAME = "Chaos Corruption";


/**
 * 로컬라이즈 헬퍼
 * @param key localization 키
 * @returns 로컬라이즈된 문자열
 */
export function localize(key: string): string {
  return game.i18n.localize(`${MODULE_ID}.${key}`);
}