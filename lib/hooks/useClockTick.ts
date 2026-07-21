import { useEffect, useState } from 'react';

// Forces a periodic re-render so date/countdown values recomputed from
// `new Date()` at render time actually pick up day rollover and tick
// forward, instead of freezing at whatever moment the screen first mounted.
export function useClockTick(intervalMs = 1000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
