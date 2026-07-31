// Supabase throws PostgrestError/AuthError/FunctionsError shapes, none of
// which actually extend Error — they just happen to have a `.message`
// field, same as a real Error. `as Error` casts worked by coincidence of
// shape; this reads the field that's actually guaranteed to exist without
// claiming a type that isn't true.
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}
