import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { connectionRepository } from '../repositories/ConnectionRepository';
import type { Connection } from '../types';

let connChannel: ReturnType<typeof supabase.channel> | null = null;

interface ConnectionState {
  sentRequests: Connection[];
  receivedRequests: Connection[];
  acceptedReceivedConnections: Connection[];
  fetchSentRequests: (userId: string) => Promise<void>;
  fetchReceivedRequests: (userId: string) => Promise<void>;
  fetchAcceptedReceived: (userId: string) => Promise<void>;
  sendRequest: (senderId: string, receiverId: string, note?: string) => Promise<Connection>;
  subscribeToUpdates: (myId: string) => void;
  unsubscribeFromUpdates: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  sentRequests: [],
  receivedRequests: [],
  acceptedReceivedConnections: [],

  fetchSentRequests: async (userId: string) => {
    const requests = await connectionRepository.getSentRequests(userId);
    set({ sentRequests: requests });
  },

  fetchReceivedRequests: async (userId: string) => {
    const requests = await connectionRepository.getReceivedRequests(userId);
    set({ receivedRequests: requests });
  },

  fetchAcceptedReceived: async (userId: string) => {
    const requests = await connectionRepository.getAcceptedReceivedConnections(userId);
    set({ acceptedReceivedConnections: requests });
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
      // My sent requests got updated (accepted/rejected)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `sender_id=eq.${myId}`,
      }, (payload) => {
        const updated = payload.new as any;
        set((s) => ({
          sentRequests: s.sentRequests.map((r) =>
            r.id === updated.id ? { ...r, status: updated.status } : r,
          ),
        }));
      })
      // Someone sent me a new request
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'connections',
        filter: `receiver_id=eq.${myId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.status !== 'pending') return;
        const incoming: Connection = {
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          note: row.note ?? undefined,
          status: row.status,
          createdAt: row.created_at,
        };
        set((s) => ({
          receivedRequests: [incoming, ...s.receivedRequests.filter((r) => r.id !== incoming.id)],
        }));
      })
      // A request I received was updated (e.g., sender withdrew it — edge case)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `receiver_id=eq.${myId}`,
      }, (payload) => {
        const updated = payload.new as any;
        set((s) => ({
          receivedRequests: updated.status === 'pending'
            ? s.receivedRequests
            : s.receivedRequests.filter((r) => r.id !== updated.id),
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
