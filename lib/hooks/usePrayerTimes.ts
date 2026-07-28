import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useLocation } from './useLocation';
import {
  computePrayerTimes,
  isBeforeTodayFajr,
  locationDateString,
  type CalcMethodKey,
  type MadhabKey,
  type SafetyMarginMinutes,
} from '../prayerTimes';

const DAY_MS = 24 * 60 * 60 * 1000;

export function usePrayerTimes(settings: { calcMethod: CalcMethodKey; madhab: MadhabKey; safetyMarginMinutes: SafetyMarginMinutes }) {
  const { coords, status } = useLocation();
  const [tick, setTick] = useState(() => Date.now());

  // Recompute periodically so the calc naturally picks up day rollover —
  // cheap enough to just rerun rather than trying to detect the location's
  // own midnight from the device's clock (that mismatch is exactly what
  // caused the original day-selection bug).
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Android throttles/suspends JS timers while backgrounded (screen locked,
  // app switched away, Doze), so the 60s interval above can silently stall
  // for hours — freezing `times`/`logDateString` from before Fajr and making
  // isBeforeTodayFajr compare a stale `now` against a stale window forever
  // (showing yesterday's completed state well into today). Force an
  // immediate recompute whenever the app comes back to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setTick(Date.now());
    });
    return () => sub.remove();
  }, []);

  const { times, logDateString, displayWindows } = useMemo(() => {
    if (!coords) return { times: null, logDateString: null, displayWindows: null };
    const now = new Date(tick);
    const params = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      calcMethod: settings.calcMethod,
      madhab: settings.madhab,
      safetyMarginMinutes: settings.safetyMarginMinutes,
    };
    const todayTimes = computePrayerTimes({ ...params, date: now });

    // Between midnight and today's real Fajr, the whole prayer day still
    // "belongs" to yesterday (Islamic day boundaries run Fajr-to-Fajr, not
    // midnight-to-midnight) — all 5 waqts + Quran should stay editable
    // against yesterday's date, not just Isha. `times.windows` itself keeps
    // today's raw entries (only Isha's start/end patched) since that's what
    // drives the app-wide "current waqt"/countdown display; `displayWindows`
    // is the separate, all-5-carried-over set the Today screen renders.
    if (isBeforeTodayFajr(todayTimes, now)) {
      const yesterdayTimes = computePrayerTimes({ ...params, date: new Date(tick - DAY_MS) });
      const patchedWindows = todayTimes.windows.map((w) =>
        w.name === 'isha' ? { ...w, start: yesterdayTimes.isha, end: todayTimes.fajr } : w,
      );
      return {
        times: { ...todayTimes, windows: patchedWindows },
        logDateString: locationDateString(todayTimes.timeZone, new Date(tick - DAY_MS)),
        displayWindows: yesterdayTimes.windows,
      };
    }

    return { times: todayTimes, logDateString: null, displayWindows: todayTimes.windows };
  }, [coords?.latitude, coords?.longitude, tick, settings.calcMethod, settings.madhab, settings.safetyMarginMinutes]);

  return { times, locationStatus: status, coords, logDateString, displayWindows };
}
