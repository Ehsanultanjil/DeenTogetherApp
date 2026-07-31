import type { WaqtName } from '../lib/prayerTimes';
import type { MaterialSymbolName } from './materialSymbols';

// Single source of truth for prayer order/labels/icons — was previously
// redeclared independently in 6-7 files, risking silent drift if one was
// ever missed on a change.
export const WAQT_ORDER: WaqtName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const WAQT_KEY: Record<WaqtName, 'waqtFajr' | 'waqtDhuhr' | 'waqtAsr' | 'waqtMaghrib' | 'waqtIsha'> = {
  fajr: 'waqtFajr',
  dhuhr: 'waqtDhuhr',
  asr: 'waqtAsr',
  maghrib: 'waqtMaghrib',
  isha: 'waqtIsha',
};

export const WAQT_ICON: Record<WaqtName, MaterialSymbolName> = {
  fajr: 'wb_twilight',
  dhuhr: 'sunny',
  asr: 'sunny',
  maghrib: 'wb_sunny',
  isha: 'bedtime',
};

// Dhuhr becomes Jumu'ah (Friday congregational prayer) on Friday — display
// label only, never a distinct WaqtName (no separate tracking/log row).
export function waqtDisplayKey(
  waqt: WaqtName,
  isJummah: boolean,
): (typeof WAQT_KEY)[WaqtName] | 'waqtJumma' {
  return waqt === 'dhuhr' && isJummah ? 'waqtJumma' : WAQT_KEY[waqt];
}
