// Sends a push notification to a family member reminding them to pray.
// Called client-side only *after* the send_prayer_reminder RPC has already
// succeeded — that RPC is the source of truth for spam-prevention and
// family-membership checks; this function is pure delivery.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const WAQT_LABEL: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const { recipientId, prayerName, senderName } = await req.json();
    if (!recipientId || !prayerName) {
      return new Response('Missing recipientId or prayerName', { status: 400 });
    }

    // Verify the caller is a real authenticated user (not that they're
    // allowed to message this specific recipient — send_prayer_reminder
    // already enforced that server-side before this function was called).
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: tokens } = await serviceClient
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', recipientId);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } });
    }

    const waqtLabel = WAQT_LABEL[prayerName] ?? prayerName;
    const body = `${senderName ?? 'A family member'} reminded you to pray ${waqtLabel}.\nMay Allah reward you.`;

    const messages = tokens.map((t) => ({
      to: t.expo_push_token,
      title: 'Prayer Reminder',
      body,
      sound: 'default',
      channelId: 'prayer-updates',
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });

    return new Response(JSON.stringify({ sent: messages.length }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(`Internal error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
});
