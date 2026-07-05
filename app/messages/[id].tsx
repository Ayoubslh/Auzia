import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/ui/Avatar';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { userRepository } from '../../repositories/UserRepository';
import { getDisplayName } from '../../utils/displayName';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { Message, User } from '../../types';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuthStore();
  const { conversations, activeMessages, fetchConversations, openConversation, closeConversation, sendMessage, markConversationRead } = useMessageStore();
  const [text, setText] = useState('');
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const listRef = useRef<FlatList>(null);

  const conversation = conversations.find((c) => c.id === id);
  const participant = conversation?.participant ?? remoteUser;

  useEffect(() => {
    if (!id || !currentUser) return;
    if (conversations.length === 0) fetchConversations();
    openConversation(id);
    const otherId = id.split('_').find((p) => p !== currentUser.id);
    if (otherId) {
      markConversationRead(currentUser.id, otherId);
      userRepository.getUserById(otherId).then((u) => { if (u) setRemoteUser(u); });
    }
    return () => { closeConversation(); };
  }, [id]);

  useEffect(() => {
    if (activeMessages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [activeMessages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !currentUser) return;
    sendMessage(trimmed, currentUser.id);
    setText('');
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        {participant && (
          <Avatar initials={participant.avatarInitials} color={participant.avatarColor} size={38} />
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {participant ? getDisplayName(participant) : '…'}
          </Text>
          <Text style={styles.headerStatus}>Hors ligne</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="call-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={activeMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.senderId === currentUser.id} participant={participant ?? null} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Votre message..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MessageBubble: React.FC<{
  message: Message;
  isOwn: boolean;
  participant: any | null;
}> = ({ message, isOwn, participant }) => (
  <View style={[bubbleStyles.row, isOwn && bubbleStyles.rowOwn]}>
    {!isOwn && participant && (
      <Avatar
        initials={participant.avatarInitials}
        color={participant.avatarColor}
        size={28}
      />
    )}
    <View style={[bubbleStyles.bubble, isOwn ? bubbleStyles.bubbleOwn : bubbleStyles.bubbleOther]}>
      <Text style={[bubbleStyles.text, isOwn && bubbleStyles.textOwn]}>
        {message.content}
      </Text>
      <View style={bubbleStyles.timeRow}>
        <Text style={[bubbleStyles.time, isOwn && bubbleStyles.timeOwn]}>
          {message.timestamp}
        </Text>
        {isOwn && (
          <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.7)" />
        )}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  headerStatus: { fontSize: FontSize.xs, color: Colors.textTertiary },
  headerActions: { flexDirection: 'row' },

  messagesList: {
    padding: Spacing.base,
    gap: Spacing.sm,
    flexGrow: 1,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    ...Platform.select({ android: { textAlignVertical: 'center' as const } }),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
});

const bubbleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  rowOwn: { flexDirection: 'row-reverse' },

  bubble: {
    maxWidth: '75%',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
    ...Shadow.sm,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },

  text: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  textOwn: { color: Colors.white },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-end',
  },
  time: { fontSize: 10, color: Colors.textTertiary },
  timeOwn: { color: 'rgba(255,255,255,0.7)' },
});
