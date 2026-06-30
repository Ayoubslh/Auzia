import { create } from 'zustand';
import { connectionRepository } from '../repositories/ConnectionRepository';
import type { Connection } from '../types';

interface ConnectionState {
  sentRequests: Connection[];
  fetchSentRequests: (userId: string) => Promise<void>;
  sendRequest: (senderId: string, receiverId: string, note?: string) => Promise<Connection>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  sentRequests: [],

  fetchSentRequests: async (userId: string) => {
    const requests = await connectionRepository.getSentRequests(userId);
    set({ sentRequests: requests });
  },

  sendRequest: async (senderId: string, receiverId: string, note?: string) => {
    const connection = await connectionRepository.sendRequest(senderId, receiverId, note);
    set((state) => ({ sentRequests: [connection, ...state.sentRequests] }));
    return connection;
  },
}));
