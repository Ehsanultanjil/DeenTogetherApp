// Deletes the caller's own account. Needs the service-role key (the
// anon/publishable client can't call auth.admin.*), so this has to be an
// Edge Function — never trust a client-supplied user id, always resolve it
// from the caller's own JWT first.
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    // Same sole-admin protection leave_family already enforces — run it
    // with the caller's own JWT so RLS/auth.uid() scope it to them.
    const { error: guardError } = await authClient.rpc('assert_account_deletable');
    if (guardError) return new Response(guardError.message, { status: 400 });

    const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);
    if (deleteError) return new Response(deleteError.message, { status: 500 });

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(`Internal error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
});
