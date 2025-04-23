import '@illandril/foundryvtt-types';
import config from './config';

/**
 * 로컬라이즈 헬퍼
 * @param key localization 키
 * @returns 로컬라이즈된 문자열
 */
export function localize(key: string): string {
  return game.i18n.localize(`${config.MODULE_ID}.${key}`);
}

