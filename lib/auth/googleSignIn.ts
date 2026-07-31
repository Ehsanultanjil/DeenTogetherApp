import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase';

// Native Google account chooser via Play Services — no browser tab. The
// webClientId is the Google Cloud "Web application" OAuth client (used as
// the ID token audience); it must match the client ID configured on the
// Google provider in the Supabase dashboard.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') {
    throw new Error('CANCELLED');
  }

  const idToken = response.data.idToken;
  if (!idToken) throw new Error('No idToken returned from Google sign-in');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
}
