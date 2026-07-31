import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'deentogether.lastHadithPopupDate';

// Shows once per (location) calendar day, only once that day's real Fajr
// has actually started (not during the pre-Fajr carryover — see
// usePrayerTimes.ts) — matches "first time you open the app after Fajr
// starts". Both the read/skip buttons dismiss identically; only the persisted
// date matters, so re-showing on a fresh mount before the user acts is fine.
export function useDailyHadithPopup(dateString: string | null, isAfterFajr: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!dateString || !isAfterFajr) return;
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((lastShown) => {
      if (!cancelled && lastShown !== dateString) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [dateString, isAfterFajr]);

  const dismiss = () => {
    if (dateString) AsyncStorage.setItem(STORAGE_KEY, dateString).catch(() => {});
    setVisible(false);
  };

  return { visible, dismiss };
}
