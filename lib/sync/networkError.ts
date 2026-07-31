// Was duplicated identically in runOrQueue.ts and syncEngine.ts.
export function looksLikeNetworkError(err: unknown): boolean {
  // A PostgrestError/FunctionsError (has a `code` string field) means the
  // server actually responded — that's a genuine rejection, never a
  // connectivity problem, no matter what its message text happens to say
  // (e.g. a Postgres "statement timeout" contains the word "timeout" but
  // isn't a network issue, and queuing it for retry would just repeat the
  // same failure forever instead of surfacing it).
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    return false;
  }
  const message = err instanceof Error ? err.message : String(err);
  return /network|fetch|timeout|offline|failed to connect/i.test(message);
}
