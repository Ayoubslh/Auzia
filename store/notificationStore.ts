import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { connectionRepository } from '../repositories/ConnectionRepository';
import { notificationRepository } from '../repositories/NotificationRepository';
import type { Notification } from '../types';

let notifChannel: ReturnType<typeof supabase.channel> | null = null;

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetch: (userId: string) => Promise<void>;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
  markAllRead: (userId: string) => Promise<void>;
  respond: (
    connectionId: string | undefined,
    actionUserId: string | undefined,
    myId: string,
    status: 'accepted' | 'rejected',
    notificationId: string,
  ) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async (userId: string) => {
    const notifications = await notificationRepository.getAll(userId);
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
  },

  subscribe: (userId: string) => {
    if (notifChannel) {
      supabase.removeChannel(notifChannel);
      notifChannel = null;
    }
    get().fetch(userId);
    notifChannel = supabase
      .channel(`notifs-${userId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        get().fetch(userId);
      })
      .subscribe();
  },

  unsubscribe: () => {
    if (notifChannel) {
      supabase.removeChannel(notifChannel);
      notifChannel = null;
    }
    set({ notifications: [], unreadCount: 0 });
  },

  markAllRead: async (userId: string) => {
    await notificationRepository.markAllRead(userId);
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  respond: async (connectionId, actionUserId, myId, status, notificationId) => {
    // When accepting, fetch the note so we can seed it as the first message
    let noteContent: string | undefined;
    let noteSenderId: string | undefined;
    if (status === 'accepted') {
      const { data } = connectionId
        ? await supabase.from('connections').select('note, sender_id').eq('id', connectionId).maybeSingle()
        : await supabase.from('connections').select('note, sender_id').eq('sender_id', actionUserId!).eq('receiver_id', myId).eq('status', 'pending').maybeSingle();
      if (data?.note) {
        noteContent = data.note;
        noteSenderId = data.sender_id;
      }
    }

    if (connectionId) {
      await connectionRepository.respond(connectionId, status);
    } else if (actionUserId) {
      await connectionRepository.respondByUsers(actionUserId, myId, status);
    } else {
      throw new Error('No connection reference available');
    }

    // Seed the connection note as the first message in the conversation
    if (status === 'accepted' && noteContent && noteSenderId) {
      await supabase
        .from('messages')
        .insert({ sender_id: noteSenderId, receiver_id: myId, content: noteContent });
    }

    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== notificationId),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },
}));
