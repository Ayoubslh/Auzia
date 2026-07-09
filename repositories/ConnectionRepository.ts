import { supabase } from '../supabase/client';
import type { Connection, ConnectionStatus } from '../types';

export interface IConnectionRepository {
  sendRequest(senderId: string, receiverId: string, note?: string): Promise<Connection>;
  getSentRequests(senderId: string): Promise<Connection[]>;
  getReceivedRequests(receiverId: string): Promise<Connection[]>;
  respond(connectionId: string, status: 'accepted' | 'rejected'): Promise<void>;
  getStatus(myId: string, otherId: string): Promise<ConnectionStatus | null>;
}

function toConnection(row: any): Connection {
  return {
    id:         row.id,
    senderId:   row.sender_id,
    receiverId: row.receiver_id,
    note:       row.note ?? undefined,
    status:     row.status as ConnectionStatus,
    createdAt:  row.created_at,
    receiverUser: row.receiver ? {
      id:              row.receiver.id,
      firstName:       row.receiver.first_name ?? '',
      lastName:        row.receiver.last_name ?? '',
      avatarInitials:  row.receiver.avatar_initials ?? '',
      avatarColor:     row.receiver.avatar_color ?? '#2E7D32',
      avatar:          row.receiver.avatar_url ?? undefined,
      nickname:        row.receiver.nickname ?? '',
      nameDisplayMode: row.receiver.name_display_mode ?? 'nickname',
    } : undefined,
  };
}

class ConnectionRepository implements IConnectionRepository {
  async sendRequest(senderId: string, receiverId: string, note?: string): Promise<Connection> {
    const { data, error } = await supabase
      .from('connections')
      .insert({ sender_id: senderId, receiver_id: receiverId, note: note ?? null })
      .select()
      .single();
    if (error) throw error;
    return toConnection(data);
  }

  async getSentRequests(senderId: string): Promise<Connection[]> {
    const { data, error } = await supabase
      .from('connections')
      .select('*, receiver:profiles!receiver_id(id,first_name,last_name,avatar_initials,avatar_color,avatar_url,nickname,name_display_mode)')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toConnection);
  }

  async getReceivedRequests(receiverId: string): Promise<Connection[]> {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('receiver_id', receiverId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toConnection);
  }

  async respond(connectionId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId);
    if (error) throw error;
  }

  async respondByUsers(senderId: string, receiverId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending');
    if (error) throw error;
  }

  async getStatus(myId: string, otherId: string): Promise<ConnectionStatus | null> {
    const { data } = await supabase
      .from('connections')
      .select('status')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`
      )
      .maybeSingle();
    return (data?.status as ConnectionStatus) ?? null;
  }
}

export const connectionRepository = new ConnectionRepository();
