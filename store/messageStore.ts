import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { messageRepository } from '../repositories/MessageRepository';
import type { Conversation, Message } from '../types';

let msgChannel: ReturnType<typeof supabase.channel> | null = null;

interface MessageState {
  conversations: Conversation[];
  activeMessages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  totalUnreadMessages: number;
  fetchConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  closeConversation: () => void;
  sendMessage: (content: string, senderId: string) => Promise<void>;
  markConversationRead: (myId: string, otherId: string) => Promise<void>;
  subscribeToMessages: (myId: string) => void;
  unsubscribeFromMessages: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  activeMessages: [],
  activeConversationId: null,
  isLoading: false,
  totalUnreadMessages: 0,

  fetchConversations: async () => {
    set({ isLoading: true });
    const conversations = await messageRepository.getConversations();
    set({ conversations, isLoading: false });
  },

  openConversation: async (conversationId: string) => {
    set({ isLoading: true, activeConversationId: conversationId });
    const messages = await messageRepository.getMessages(conversationId);
    set({ activeMessages: messages, isLoading: false });
  },

  closeConversation: () => {
    set({ activeConversationId: null, activeMessages: [] });
  },

  sendMessage: async (content: string, senderId: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;
    const newMessage = await messageRepository.sendMessage(activeConversationId, content, senderId);
    set((state) => ({ activeMessages: [...state.activeMessages, newMessage] }));
  },

  markConversationRead: async (myId: string, otherId: string) => {
    await messageRepository.markAsRead(myId, otherId);
    const count = await messageRepository.getTotalUnread(myId);
    set({ totalUnreadMessages: count });
  },

  subscribeToMessages: (myId: string) => {
    if (msgChannel) {
      supabase.removeChannel(msgChannel);
      msgChannel = null;
    }

    messageRepository.getTotalUnread(myId).then((count) => {
      set({ totalUnreadMessages: count });
    });

    msgChannel = supabase
      .channel(`msgs-${myId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${myId}`,
      }, (payload) => {
        const row = payload.new as any;
        const msg: Message = {
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          content: row.content,
          timestamp: new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          read: row.read,
        };

        const { activeConversationId } = get();
        const convParts = activeConversationId?.split('_') ?? [];
        const isActiveConv = convParts.includes(msg.senderId);

        if (isActiveConv) {
          set((s) => ({ activeMessages: [...s.activeMessages, msg] }));
          messageRepository.markAsRead(myId, msg.senderId);
        } else {
          set((s) => ({
            totalUnreadMessages: s.totalUnreadMessages + 1,
            conversations: s.conversations.map((c) =>
              c.participant.id === msg.senderId
                ? { ...c, lastMessage: msg, unreadCount: c.unreadCount + 1 }
                : c,
            ),
          }));
        }
      })
      .subscribe();
  },

  unsubscribeFromMessages: () => {
    if (msgChannel) {
      supabase.removeChannel(msgChannel);
      msgChannel = null;
    }
    set({ totalUnreadMessages: 0 });
  },
}));
