import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

const TYPE_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  connection_request: { icon: 'person-add-outline', color: Colors.primary, bg: Colors.primaryLight },
  message: { icon: 'chatbubble-outline', color: Colors.info, bg: '#EFF6FF' },
  announcement: { icon: 'megaphone-outline', color: Colors.warning, bg: '#FFFBEB' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { notifications, markAllRead, respond } = useNotificationStore();
  const myId = currentUser?.id ?? '';

  const handleRespond = async (
    connectionId: string | undefined,
    actionUserId: string | undefined,
    status: 'accepted' | 'rejected',
    notificationId: string,
  ) => {
    try {
      await respond(connectionId, actionUserId, myId, status, notificationId);
    } catch (e: any) {
      const isRls = e?.message === 'RLS_BLOCKED';
      Alert.alert(
        'Erreur',
        isRls
          ? 'Permission refusée. Vérifiez les politiques RLS de Supabase sur la table connections.'
          : e?.message ?? 'Une erreur est survenue.',
      );
    }
  };

  useEffect(() => {
    if (currentUser) markAllRead(currentUser.id);
  }, []);

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
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const style = TYPE_ICON[item.type] ?? TYPE_ICON.announcement;
          const hasActor = !!item.actorInitials;
          const canViewProfile = item.type === 'connection_request' && !!item.actionUserId;

          return (
            <TouchableOpacity
              style={[styles.row, !item.read && styles.rowUnread]}
              activeOpacity={canViewProfile ? 0.7 : 1}
              onPress={() => {
                if (canViewProfile) router.push(`/user/${item.actionUserId}` as any);
              }}
            >
              {hasActor ? (
                <Avatar
                  initials={item.actorInitials!}
                  color={item.actorColor ?? Colors.primary}
                  size={44}
                  imageUrl={item.actorImageUrl}
                />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: style.bg }]}>
                  <Ionicons name={style.icon as any} size={20} color={style.color} />
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.content}>{item.content}</Text>

                {item.type === 'connection_request' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRespond(item.connectionId, item.actionUserId, 'accepted', item.id);
                      }}
                    >
                      <Text style={styles.acceptText}>{t('notifications.accept')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRespond(item.connectionId, item.actionUserId, 'rejected', item.id);
                      }}
                    >
                      <Text style={styles.rejectText}>{t('notifications.refuse')}</Text>
                    </TouchableOpacity>
                    {!!item.actionUserId && (
                      <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={() => router.push(`/user/${item.actionUserId}` as any)}
                      >
                        <Text style={styles.profileBtnText}>{t('common.see_profile')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
          </View>
        }
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  actions: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
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
  profileBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  profileBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.textTertiary },
});
