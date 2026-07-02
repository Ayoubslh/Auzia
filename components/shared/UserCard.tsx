import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { User } from '../../types';

interface UserCardProps {
  user: User;
  onConnect?: () => void;
  onMessage?: () => void;
  isPending?: boolean;
  isConnected?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onConnect, onMessage, isPending = false, isConnected = false }) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar initials={user.avatarInitials} color={user.avatarColor} size={44} />

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.flag}>{user.countryOfResidenceFlag}</Text>
          </View>
          <Text style={styles.status}>{user.status}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{user.cityOfResidence}</Text>
        <View style={styles.dot} />
        <Text style={styles.metaText}>{user.workField}</Text>
        {user.commonConnections !== undefined && user.commonConnections > 0 && (
          <>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{user.commonConnections}{t('user_card.common')}</Text>
          </>
        )}
      </View>

      {user.aboutMe && (
        <Text style={styles.about} numberOfLines={2}>{user.aboutMe}</Text>
      )}

      <View style={styles.actions}>
        <Button
          label={t('user_card.see_profile')}
          variant="outline"
          size="sm"
          onPress={() => router.push(`/user/${user.id}`)}
          style={styles.profileBtn}
        />
        {isConnected ? (
          <Button
            label="Message"
            variant="primary"
            size="sm"
            onPress={onMessage ?? (() => {})}
            style={styles.connectBtn}
          />
        ) : isPending ? (
          <View style={[styles.connectBtn, styles.pendingBtn]}>
            <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
            <Text style={styles.pendingText}>{t('user_card.pending')}</Text>
          </View>
        ) : (
          <Button
            label={t('user_card.connect')}
            variant="primary"
            size="sm"
            onPress={onConnect ?? (() => {})}
            style={styles.connectBtn}
          />
        )}
      </View>
    </View>
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
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  flag: { fontSize: 13 },
  status: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { fontSize: FontSize.sm, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textTertiary },
  about: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  profileBtn: { flex: 1 },
  connectBtn: { flex: 1 },
  pendingBtn: {
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
  pendingText: { fontSize: FontSize.sm, color: Colors.textTertiary, fontWeight: FontWeight.medium },
});
