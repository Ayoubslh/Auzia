import { create } from 'zustand';
import { messageRepository } from '../repositories/MessageRepository';
import type { Conversation, Message } from '../types';

interface MessageState {
  conversations: Conversation[];
  activeMessages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  fetchConversations: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, senderId: string) => Promise<void>;
  getTotalUnread: () => number;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  activeMessages: [],
  activeConversationId: null,
  isLoading: false,

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

  sendMessage: async (content: string, senderId: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;
    const newMessage = await messageRepository.sendMessage(activeConversationId, content, senderId);
    set((state) => ({ activeMessages: [...state.activeMessages, newMessage] }));
  },

  getTotalUnread: () => {
    return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  },
}));
