import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { connectionRepository } from '../repositories/ConnectionRepository';
import type { Connection } from '../types';

let connChannel: ReturnType<typeof supabase.channel> | null = null;

interface ConnectionState {
  sentRequests: Connection[];
  fetchSentRequests: (userId: string) => Promise<void>;
  sendRequest: (senderId: string, receiverId: string, note?: string) => Promise<Connection>;
  subscribeToUpdates: (myId: string) => void;
  unsubscribeFromUpdates: () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
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

  subscribeToUpdates: (myId: string) => {
    if (connChannel) {
      supabase.removeChannel(connChannel);
      connChannel = null;
    }
    connChannel = supabase
      .channel(`connections-${myId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `sender_id=eq.${myId}`,
      }, (payload) => {
        const updated = payload.new as any;
        set((s) => ({
          sentRequests: s.sentRequests.map((r) =>
            r.id === updated.id ? { ...r, status: updated.status } : r
          ),
        }));
      })
      .subscribe();
  },

  unsubscribeFromUpdates: () => {
    if (connChannel) {
      supabase.removeChannel(connChannel);
      connChannel = null;
    }
  },
}));
