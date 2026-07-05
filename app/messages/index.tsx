import React, { useEffect } from 'react';
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

type ListItem =
  | { kind: 'invite'; connection: Connection; user: ConnectionUser }
  | { kind: 'conversation'; conversation: Conversation };

export default function MessagesScreen() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { conversations, fetchConversations } = useMessageStore();
  const { sentRequests, fetchSentRequests } = useConnectionStore();

  useEffect(() => {
    fetchConversations();
    if (currentUser) fetchSentRequests(currentUser.id);
  }, [currentUser?.id]);

  const invites = sentRequests
    .filter((c) => c.receiverUser != null)
    .map((c) => ({ connection: c, user: c.receiverUser! }));

  const listData: ListItem[] = [
    ...invites.map((i) => ({ kind: 'invite' as const, connection: i.connection, user: i.user })),
    ...conversations.map((c) => ({ kind: 'conversation' as const, conversation: c })),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
      </View>

      {/* Pending invitations */}
      {invites.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentLabel}>NOUVELLES INVITATIONS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRow}
          >
            {invites.map(({ connection, user }) => (
              <TouchableOpacity
                key={connection.id}
                style={styles.recentAvatar}
                activeOpacity={0.8}
              >
                <Avatar initials={user.avatarInitials} color={user.avatarColor} size={48} />
                <View style={styles.pendingBadge}>
                  <Ionicons
                    name={connection.note ? 'chatbox-ellipses' : 'time'}
                    size={11}
                    color={Colors.white}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Conversation list */}
      <FlatList
        data={listData}
        keyExtractor={(item) =>
          item.kind === 'invite' ? `invite-${item.connection.id}` : item.conversation.id
        }
        renderItem={({ item }) =>
          item.kind === 'invite' ? (
            <InviteRow connection={item.connection} user={item.user} />
          ) : (
            <ConversationRow conversation={item.conversation} />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const InviteRow: React.FC<{ connection: Connection; user: ConnectionUser }> = ({ connection, user }) => (
  <View style={convStyles.row}>
    <View style={{ position: 'relative' }}>
      <Avatar initials={user.avatarInitials} color={user.avatarColor} size={50} />
    </View>

    <View style={convStyles.info}>
      <View style={convStyles.topRow}>
        <Text style={convStyles.name}>
          {getDisplayName(user)}
        </Text>
        <View style={convStyles.pendingTag}>
          <Text style={convStyles.pendingTagText}>En attente</Text>
        </View>
      </View>
      <Text style={convStyles.lastMsg} numberOfLines={1}>
        {connection.note ? `Note : ${connection.note}` : 'Demande de connexion envoyée'}
      </Text>
    </View>
  </View>
);

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
        />
        {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
      </View>

      <View style={convStyles.info}>
        <View style={convStyles.topRow}>
          <Text style={convStyles.name}>
            {getDisplayName(participant)}
          </Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },

  recentSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.xs,
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
  name: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary },
  lastMsg: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lastMsgUnread: { fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  pendingTag: {
    backgroundColor: Colors.badgeOrangeBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pendingTagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.badgeOrange,
  },
});
