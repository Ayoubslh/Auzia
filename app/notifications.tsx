import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../components/ui/Avatar';
import { MOCK_NOTIFICATIONS, MOCK_USERS } from '../mock';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

const TYPE_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  connection_request: { icon: 'person-add-outline', color: Colors.primary, bg: Colors.primaryLight },
  message: { icon: 'chatbubble-outline', color: Colors.info, bg: '#EFF6FF' },
  announcement: { icon: 'megaphone-outline', color: Colors.warning, bg: '#FFFBEB' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const style = TYPE_ICON[item.type];
          const actor = item.actionUserId
            ? MOCK_USERS.find((u) => u.id === item.actionUserId)
            : null;

          return (
            <View style={[styles.row, !item.read && styles.rowUnread]}>
              {actor ? (
                <Avatar initials={actor.avatarInitials} color={actor.avatarColor} size={44} />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: style.bg }]}>
                  <Ionicons name={style.icon as any} size={20} color={style.color} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.content}>{item.content}</Text>
                {item.type === 'connection_request' && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.acceptBtn}>
                      <Text style={styles.acceptText}>{t('notifications.accept')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn}>
                      <Text style={styles.rejectText}>{t('notifications.refuse')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  list: { paddingBottom: Spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowUnread: { backgroundColor: Colors.primaryLight + '44' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: Spacing.sm },
  content: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  acceptBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  acceptText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.semibold },
  rejectBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
  },
  rejectText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
});
