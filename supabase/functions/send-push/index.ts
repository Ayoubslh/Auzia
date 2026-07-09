import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    const payload = await req.json();
    const notification = payload?.record;

    if (!notification?.user_id || !notification?.content) {
      return new Response('Missing fields', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', notification.user_id)
      .single();

    const pushToken = profile?.push_token;
    if (!pushToken || !pushToken.startsWith('ExponentPushToken[')) {
      return new Response('No valid push token', { status: 200 });
    }

    const title = titleForType(notification.type);

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body: notification.content,
        sound: 'default',
        data: {
          type: notification.type,
          actionUserId: notification.action_user_id,
          actionId: notification.action_id,
        },
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});

function titleForType(type: string): string {
  switch (type) {
    case 'connection_request':  return 'Nouvelle demande de connexion';
    case 'connection_accepted': return 'Demande acceptée !';
    case 'message':             return 'Nouveau message';
    default:                    return 'Auzia';
  }
}
