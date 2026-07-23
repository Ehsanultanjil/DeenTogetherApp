import { useEffect } from 'react';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

// Registers this device's Expo push token against the signed-in user, so
// the send-reminder Edge Function has somewhere to deliver to. No-ops
// quietly if the EAS project isn't linked yet (no projectId) or permission
// hasn't been granted — the local prayer-time notification flow (which
// doesn't need any of this) keeps working either way.
export function usePushToken() {
  const userId = useAuthStore((s) => s.session?.user.id);

  useEffect(() => {
    if (!userId) return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        await supabase.from('push_tokens').upsert(
          { user_id: userId, expo_push_token: token, updated_at: new Date().toISOString() },
          { onConflict: 'expo_push_token' },
        );
      } catch {
        // Push token retrieval can fail offline / on emulators without
        // Play Services — not fatal to the rest of the app.
      }
    })();
  }, [userId]);
}
