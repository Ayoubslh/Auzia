import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { getDisplayName } from '../../utils/displayName';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { User } from '../../types';

interface UserCardProps {
  user: User;
  onConnect?: () => void;
  onMessage?: () => void;
  onRespond?: () => void;
  isPending?: boolean;
  isConnected?: boolean;
  isReceivedPending?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onConnect,
  onMessage,
  onRespond,
  isPending = false,
  isConnected = false,
  isReceivedPending = false,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const renderAction = () => {
    if (isConnected) {
      if (user.allowChat === false) {
        return (
          <View style={[styles.actionBtn, styles.disabledBtn]}>
            <Ionicons name="lock-closed-outline" size={13} color={Colors.textTertiary} />
            <Text style={styles.mutedText}>Désactivé</Text>
          </View>
        );
      }
      return (
        <Button
          label="Message"
          variant="primary"
          size="sm"
          onPress={onMessage ?? (() => {})}
          style={styles.actionBtn}
        />
      );
    }
    if (isReceivedPending) {
      return (
        <Button
          label="Répondre"
          variant="outline"
          size="sm"
          onPress={onRespond ?? (() => router.push('/notifications' as any))}
          style={styles.actionBtn}
        />
      );
    }
    if (isPending) {
      return (
        <View style={[styles.actionBtn, styles.disabledBtn]}>
          <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.mutedText}>{t('user_card.pending')}</Text>
        </View>
      );
    }
    return (
      <Button
        label={t('user_card.connect')}
        variant="primary"
        size="sm"
        onPress={onConnect ?? (() => {})}
        style={styles.actionBtn}
      />
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/user/${user.id}` as any)}
      activeOpacity={0.96}
    >
      <View style={styles.header}>
        <Avatar
          initials={user.avatarInitials}
          color={user.avatarColor}
          size={44}
          imageUrl={user.avatar}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{getDisplayName(user)}</Text>
            <Text style={styles.flag}>{user.countryOfResidenceFlag}</Text>
          </View>
          <Text style={styles.status} numberOfLines={1}>{user.status}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{user.cityOfResidence}</Text>
        {user.workField ? (
          <>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{user.workField}</Text>
          </>
        ) : null}
        {user.commonConnections !== undefined && user.commonConnections > 0 && (
          <>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{user.commonConnections}{t('user_card.common')}</Text>
          </>
        )}
      </View>

      {user.aboutMe ? (
        <Text style={styles.about} numberOfLines={2}>{user.aboutMe}</Text>
      ) : null}

      {/* Action button only — card tap goes to profile */}
      <View style={styles.actions}>
        {renderAction()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  headerInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  flag: { fontSize: 13 },
  status: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  metaText: { fontSize: FontSize.sm, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textTertiary },
  about: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  actionBtn: { flex: 1 },
  disabledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  mutedText: { fontSize: FontSize.sm, color: Colors.textTertiary, fontWeight: FontWeight.medium },
});
