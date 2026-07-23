import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../supabase';

// Required once at module load so the browser tab opened by
// openAuthSessionAsync knows to hand control back to the app when Supabase
// redirects to our custom scheme.
WebBrowser.maybeCompleteAuthSession();

// Supabase's hosted OAuth (browser-based) rather than the native Google SDK
// — avoids an extra native dependency since expo-web-browser is already
// installed and used nowhere else for auth yet.
export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('CANCELLED');
  }

  // Supabase returns tokens in the URL fragment (#access_token=...), not
  // query params — normalize to `?` so URLSearchParams can read them.
  const url = new URL(result.url.replace('#', '?'));
  const accessToken = url.searchParams.get('access_token');
  const refreshToken = url.searchParams.get('refresh_token');
  if (!accessToken || !refreshToken) {
    throw new Error('Missing tokens in Google sign-in redirect');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) throw sessionError;
}
