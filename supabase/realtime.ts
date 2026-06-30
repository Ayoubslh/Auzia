import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Chat: subscribe to new messages for a conversation ────────────────────────
// Call inside the chat screen. Returns a cleanup function.
export function subscribeToMessages(
  myId: string,
  otherId: string,
  onNewMessage: (msg: any) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`messages:${[myId, otherId].sort().join('-')}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        // Only rows where I'm a participant
        filter: `receiver_id=eq.${myId}`,
      },
      (payload) => {
        // Only messages from this specific conversation
        if (payload.new.sender_id === otherId) {
          onNewMessage(payload.new);
        }
      },
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Connections: notify when someone sends or responds to a request ───────────
export function subscribeToConnections(
  myId: string,
  onUpdate: (conn: any) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`connections:${myId}`)
    .on(
      'postgres_changes',
      {
        event: '*',   // INSERT (new request) + UPDATE (accepted / rejected)
        schema: 'public',
        table: 'connections',
        filter: `receiver_id=eq.${myId}`,
      },
      (payload) => onUpdate(payload.new ?? payload.old),
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Notifications: real-time bell badge ──────────────────────────────────────
export function subscribeToNotifications(
  myId: string,
  onNotification: (notif: any) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`notifications:${myId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${myId}`,
      },
      (payload) => onNotification(payload.new),
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
