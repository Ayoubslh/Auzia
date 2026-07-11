import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/ui/Avatar';
import { NotificationBadge } from '../../components/ui/Badge';
import { useMessageStore } from '../../store/messageStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useAuthStore } from '../../store/authStore';
import { getDisplayName } from '../../utils/displayName';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import type { Conversation, Connection, ConnectionUser } from '../../types';

function fallbackUser(id: string): ConnectionUser {
  return {
    id,
    firstName: '',
    lastName: '',
    nickname: '…',
    avatarInitials: '?',
    avatarColor: '#9E9E9E',
    nameDisplayMode: 'nickname' as const,
  };
}

type SectionHeader = { kind: 'header'; label: string };
type InviteItem = { kind: 'invite'; connection: Connection; user: ConnectionUser };
type ConversationItem = { kind: 'conversation'; conversation: Conversation };
type ConnectedItem = { kind: 'connected'; connection: Connection; user: ConnectionUser };
type ListItem = SectionHeader | InviteItem | ConversationItem | ConnectedItem;

export default function MessagesScreen() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { conversations, fetchConversations } = useMessageStore();
  const {
    sentRequests,
    acceptedReceivedConnections,
    fetchSentRequests,
    fetchAcceptedReceived,
  } = useConnectionStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
    if (currentUser) {
      fetchSentRequests(currentUser.id);
      fetchAcceptedReceived(currentUser.id);
    }
  }, [currentUser?.id]);

  // Pending sent requests (no note) → horizontal strip
  const pendingSentNoNote = sentRequests.filter(
    (c) => c.status === 'pending' && !c.note,
  );

  // Pending sent WITH note → vertical section
  const pendingSentWithNote = sentRequests.filter(
    (c) => c.status === 'pending' && !!c.note,
  );

  // Accepted connections that don't have a conversation yet
  const conversationParticipantIds = new Set(conversations.map((c) => c.participant.id));

  const acceptedSentNoChat = sentRequests.filter(
    (c) =>
      c.status === 'accepted' &&
      !conversationParticipantIds.has(c.receiverId),
  );

  const acceptedReceivedNoChat = acceptedReceivedConnections.filter(
    (c) => !conversationParticipantIds.has(c.senderId),
  );

  const listData: ListItem[] = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const matchUser = (user: ConnectionUser) =>
      !q || getDisplayName(user).toLowerCase().includes(q);

    const rows: ListItem[] = [];

    // Pending with note section — include even if receiverUser is missing
    const noteInvites = pendingSentWithNote.filter(
      (c) => !q || (c.receiverUser ? matchUser(c.receiverUser) : true),
    );
    if (noteInvites.length > 0) {
      rows.push({ kind: 'header', label: 'DEMANDES AVEC NOTE' });
      for (const c of noteInvites) {
        rows.push({ kind: 'invite', connection: c, user: c.receiverUser ?? fallbackUser(c.receiverId) });
      }
    }

    // Conversations section
    const filteredConvs = conversations.filter(
      (c) =>
        !q ||
        getDisplayName(c.participant).toLowerCase().includes(q) ||
        c.lastMessage?.content?.toLowerCase().includes(q),
    );
    if (filteredConvs.length > 0) {
      rows.push({ kind: 'header', label: 'MESSAGES' });
      for (const c of filteredConvs) {
        rows.push({ kind: 'conversation', conversation: c });
      }
    }

    // Connected users with no chat
    const sentConnected = acceptedSentNoChat.filter(
      (c) => !q || (c.receiverUser ? matchUser(c.receiverUser) : true),
    );
    const receivedConnected = acceptedReceivedNoChat.filter(
      (c) => !q || (c.senderUser ? matchUser(c.senderUser) : true),
    );
    if (sentConnected.length + receivedConnected.length > 0) {
      rows.push({ kind: 'header', label: 'CONNEXIONS' });
      for (const c of sentConnected) {
        rows.push({ kind: 'connected', connection: c, user: c.receiverUser ?? fallbackUser(c.receiverId) });
      }
      for (const c of receivedConnected) {
        rows.push({ kind: 'connected', connection: c, user: c.senderUser ?? fallbackUser(c.senderId) });
      }
    }

    return rows;
  }, [
    pendingSentWithNote,
    conversations,
    acceptedSentNoChat,
    acceptedReceivedNoChat,
    searchQuery,
  ]);

  const horizontalStrip =
    pendingSentNoNote.length > 0 ? (
      <View style={styles.recentSection}>
        <Text style={styles.recentLabel}>DEMANDES ENVOYÉES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRow}
        >
          {pendingSentNoNote.map((c) => {
            const user = c.receiverUser ?? fallbackUser(c.receiverId);
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.recentAvatar}
                activeOpacity={0.8}
                onPress={() => router.push(`/user/${user.id}` as any)}
              >
                <Avatar
                  initials={user.avatarInitials}
                  color={user.avatarColor}
                  size={52}
                  imageUrl={user.avatar}
                />
                <View style={styles.pendingBadge}>
                  <Ionicons name="time" size={11} color={Colors.white} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, i) => {
          if (item.kind === 'header') return `header-${item.label}`;
          if (item.kind === 'invite') return `invite-${item.connection.id}`;
          if (item.kind === 'conversation') return item.conversation.id;
          return `connected-${item.connection.id}`;
        }}
        ListHeaderComponent={horizontalStrip}
        renderItem={({ item }) => {
          if (item.kind === 'header') return <SectionHead label={item.label} />;
          if (item.kind === 'invite')
            return <InviteRow connection={item.connection} user={item.user} />;
          if (item.kind === 'conversation')
            return <ConversationRow conversation={item.conversation} />;
          return <ConnectedRow connection={item.connection} user={item.user} />;
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const SectionHead: React.FC<{ label: string }> = ({ label }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const InviteRow: React.FC<{ connection: Connection; user: ConnectionUser }> = ({
  connection,
  user,
}) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={convStyles.row}
      activeOpacity={0.8}
      onPress={() => router.push(`/user/${user.id}` as any)}
    >
      <View style={{ position: 'relative' }}>
        <Avatar
          initials={user.avatarInitials}
          color={user.avatarColor}
          size={50}
          imageUrl={user.avatar}
        />
        <View style={convStyles.noteBadge}>
          <Ionicons name="chatbox-ellipses" size={10} color={Colors.white} />
        </View>
      </View>

      <View style={convStyles.info}>
        <View style={convStyles.topRow}>
          <Text style={convStyles.name}>{getDisplayName(user)}</Text>
          <View style={convStyles.pendingTag}>
            <Text style={convStyles.pendingTagText}>En attente</Text>
          </View>
        </View>
        <Text style={convStyles.lastMsg} numberOfLines={1}>
          {`"${connection.note}"`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ConversationRow: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
  const router = useRouter();
  const { participant, lastMessage, unreadCount } = conversation;

  return (
    <TouchableOpacity
      style={convStyles.row}
      onPress={() => router.push(`/messages/${conversation.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative' }}>
        <Avatar
          initials={participant.avatarInitials}
          color={participant.avatarColor}
          size={50}
          imageUrl={participant.avatar}
        />
        {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
      </View>

      <View style={convStyles.info}>
        <View style={convStyles.topRow}>
          <Text style={convStyles.name}>{getDisplayName(participant)}</Text>
          <Text style={convStyles.time}>{lastMessage.timestamp}</Text>
        </View>
        <Text
          style={[convStyles.lastMsg, unreadCount > 0 && convStyles.lastMsgUnread]}
          numberOfLines={1}
        >
          {lastMessage.content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ConnectedRow: React.FC<{ connection: Connection; user: ConnectionUser }> = ({ user }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={convStyles.row}
      activeOpacity={0.8}
      onPress={() => router.push(`/user/${user.id}` as any)}
    >
      <Avatar initials={user.avatarInitials} color={user.avatarColor} size={50} imageUrl={user.avatar} />
      <View style={convStyles.info}>
        <View style={convStyles.topRow}>
          <Text style={convStyles.name}>{getDisplayName(user)}</Text>
          <View style={convStyles.connectedTag}>
            <Text style={convStyles.connectedTagText}>Connecté</Text>
          </View>
        </View>
        <Text style={convStyles.lastMsg}>Démarrer une conversation</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },

  recentSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  recentLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  recentRow: { gap: Spacing.base, paddingBottom: 2 },
  recentAvatar: { position: 'relative' },
  pendingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },

  listContent: { paddingBottom: Spacing.xxl },
});

const convStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary },
  lastMsg: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lastMsgUnread: { fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  pendingTag: {
    backgroundColor: Colors.badgeOrangeBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pendingTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.badgeOrange },
  connectedTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  connectedTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.primary },
  noteBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
