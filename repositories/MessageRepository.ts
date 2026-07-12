import { supabase } from '../supabase/client';
import type { Conversation, Message } from '../types';

export interface IMessageRepository {
  getConversations(): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(conversationId: string, content: string, senderId: string): Promise<Message>;
  markAsRead(myId: string, otherId: string): Promise<void>;
  getTotalUnread(myId: string): Promise<number>;
}

function toMessage(row: any): Message {
  return {
    id:         row.id,
    senderId:   row.sender_id,
    receiverId: row.receiver_id,
    content:    row.content,
    timestamp:  new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    read:       row.read,
  };
}

class MessageRepository implements IMessageRepository {
  async getConversations(): Promise<Conversation[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    const myId = session.user.id;

    // Fetch all messages I'm part of + unread counts in parallel
    const [messagesResult, unreadResult] = await Promise.all([
      supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(id,nickname,first_name,last_name,name_display_mode,avatar_url,avatar_initials,avatar_color), receiver:profiles!receiver_id(id,nickname,first_name,last_name,name_display_mode,avatar_url,avatar_initials,avatar_color)')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false }),
      supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', myId)
        .eq('read', false),
    ]);

    if (messagesResult.error) throw messagesResult.error;

    // Build unread count per sender
    const unreadBySender: Record<string, number> = {};
    for (const row of unreadResult.data ?? []) {
      unreadBySender[row.sender_id] = (unreadBySender[row.sender_id] ?? 0) + 1;
    }

    // Deduplicate: keep only the most recent message per pair
    const seen = new Set<string>();
    const deduped = (messagesResult.data ?? []).filter((row: any) => {
      const key = [row.sender_id, row.receiver_id].sort().join('_');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped.map((row: any): Conversation => {
      const isMe = row.sender_id === myId;
      const p = isMe ? row.receiver : row.sender;
      return {
        id: [row.sender_id, row.receiver_id].sort().join('_'),
        participant: {
          id:             p.id,
          nickname:       p.nickname ?? '',
          firstName:      p.first_name ?? '',
          lastName:       p.last_name ?? '',
          nameDisplayMode: p.name_display_mode ?? 'nickname',
          avatar:         p.avatar_url ?? undefined,
          avatarInitials: p.avatar_initials ?? '',
          avatarColor:    p.avatar_color ?? '#2E7D32',
          email: '',
          countryOfResidence: '', countryOfResidenceFlag: '',
          cityOfResidence: '', workField: '',
          connectionCount: 0, countriesCount: 0, memberSince: '',
          latitude: 0, longitude: 0,
        },
        lastMessage: toMessage(row),
        unreadCount: isMe ? 0 : (unreadBySender[p.id] ?? 0),
      };
    });
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    const myId = session.user.id;
    // conversationId is composite "idA_idB" — extract the other participant's ID
    const otherId = conversationId.split('_').find((id) => id !== myId) ?? conversationId;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(toMessage);
  }

  async sendMessage(conversationId: string, content: string, senderId: string): Promise<Message> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');
    const myId = session.user.id;
    const receiverId = conversationId.split('_').find((id) => id !== myId) ?? conversationId;

    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, content })
      .select()
      .single();
    if (error) throw error;
    return toMessage(data);
  }

  async markAsRead(myId: string, otherId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', myId)
      .eq('sender_id', otherId)
      .eq('read', false);
  }

  async getTotalUnread(myId: string): Promise<number> {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', myId)
      .eq('read', false);
    return count ?? 0;
  }
}

export const messageRepository = new MessageRepository();
