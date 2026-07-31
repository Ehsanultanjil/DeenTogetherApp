import AsyncStorage from '@react-native-async-storage/async-storage';

// Shared shape for the read/parse/swallow-corrupt-data boilerplate that was
// independently reimplemented in every persisted zustand store (locale,
// theme, location preference, last-known coords, sync queue) — corrupt or
// unreadable storage falls back to null so the caller keeps its own default
// rather than blocking startup.
export async function readPersisted<T>(key: string, parse: (raw: string) => T | null): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return parse(raw);
  } catch {
    return null;
  }
}

export function writePersisted(key: string, value: string) {
  AsyncStorage.setItem(key, value).catch(() => {});
}

export function clearPersisted(key: string) {
  AsyncStorage.removeItem(key).catch(() => {});
}
