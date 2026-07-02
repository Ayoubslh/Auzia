import { supabase } from '../supabase/client';
import type { Notification } from '../types';

function toNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    content: row.content,
    read: row.read,
    createdAt: row.created_at,
    actionUserId: row.action_user_id ?? undefined,
    connectionId: row.connection_id ?? undefined,
    actorInitials: row.actor?.avatar_initials ?? undefined,
    actorColor: row.actor?.avatar_color ?? undefined,
  };
}

class NotificationRepository {
  async getAll(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!action_user_id(id,avatar_initials,avatar_color)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(toNotification);
  }

  async markAllRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  }
}

export const notificationRepository = new NotificationRepository();
