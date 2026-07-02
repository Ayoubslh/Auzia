import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ConnectModal } from '../../components/shared/ConnectModal';
import { userRepository } from '../../repositories/UserRepository';
import { connectionRepository } from '../../repositories/ConnectionRepository';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useConnectionStore } from '../../store/connectionStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { ConnectionStatus, User } from '../../types';

export default function UserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuthStore();
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const { sendRequest: sendConnectionRequest, sentRequests } = useConnectionStore();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [fetchedStatus, setFetchedStatus] = useState<ConnectionStatus | null>(null);

  // Live status: prefer the store's value for sent requests (updates via Realtime),
  // fall back to the DB-fetched value for received requests
  const storeConnection = sentRequests.find((r) => r.receiverId === id);
  const connectionStatus: ConnectionStatus | null = storeConnection?.status ?? fetchedStatus;

  useEffect(() => {
    if (id) userRepository.getUserById(id).then(setUser);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser && id) {
        connectionRepository.getStatus(currentUser.id, id).then(setFetchedStatus);
      }
    }, [currentUser?.id, id])
  );

  if (!user) return null;

  const handleSendConnectRequest = async (note: string) => {
    setConnectModalVisible(false);
    if (currentUser) {
      await sendConnectionRequest(currentUser.id, user.id, note);
      setFetchedStatus('pending');
    }
    showToast(t('user.request_sent', { name: user.firstName }));
  };

  const conversationId = currentUser
    ? [currentUser.id, user.id].sort().join('_')
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.coverHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.xxl + insets.bottom }]}
      >
        <View style={styles.coverSection}>
          <View style={styles.cover} />
          <View style={styles.avatarWrap}>
            <Avatar initials={user.avatarInitials} color={user.avatarColor} size={72} showBorder />
          </View>
        </View>

        <View style={styles.identitySection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {user.firstName} {user.lastName} {user.countryOfResidenceFlag}
            </Text>
          </View>
          <Text style={styles.handle}>
            @{user.nickname} · {user.status} · {user.cityOfResidence}
          </Text>

          {currentUser?.id !== user.id && (
            <View style={styles.ctaRow}>
              {connectionStatus === 'accepted' ? (
                <Button
                  label="Message"
                  variant="primary"
                  size="md"
                  onPress={() => conversationId && router.push(`/messages/${conversationId}` as any)}
                  fullWidth
                  style={styles.ctaBtn}
                />
              ) : connectionStatus === 'pending' ? (
                <Button
                  label={t('user_card.pending')}
                  variant="outline"
                  size="md"
                  onPress={() => {}}
                  fullWidth
                  style={styles.ctaBtn}
                />
              ) : (
                <Button
                  label={t('user.connect_cta')}
                  variant="primary"
                  size="md"
                  onPress={() => setConnectModalVisible(true)}
                  fullWidth
                  style={styles.ctaBtn}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <StatItem value={user.connectionCount} label={t('profile.stat_connections')} />
          <View style={styles.statDivider} />
          <StatItem value={user.countriesCount} label={t('profile.stat_countries')} />
          <View style={styles.statDivider} />
          <StatItem value={user.memberSince} label={t('profile.stat_since')} />
        </View>

        {user.aboutMe && (
          <Section title={t('profile.about_section')}>
            <Text style={styles.aboutText}>{user.aboutMe}</Text>
          </Section>
        )}

        <Section title={t('profile.info_section')}>
          <DetailRow icon="briefcase-outline" label={t('profile.field_domain')} value={user.workField} />
          <DetailRow
            icon="earth-outline"
            label={t('profile.field_origin')}
            value={`${user.countryOfOrigin} ${user.countryOfOriginFlag}`}
          />
          <DetailRow
            icon="location-outline"
            label={t('profile.field_residence')}
            value={`${user.cityOfResidence}, ${user.countryOfResidence}`}
          />
        </Section>
      </ScrollView>

      <ConnectModal
        visible={connectModalVisible}
        userName={`${user.firstName} ${user.lastName}`}
        avatarInitials={user.avatarInitials}
        avatarColor={user.avatarColor}
        onClose={() => setConnectModalVisible(false)}
        onSend={handleSendConnectRequest}
      />
    </SafeAreaView>
  );
}

const StatItem: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const DetailRow: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon as any} size={16} color={Colors.primary} />
    </View>
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  coverHeader: {
    position: 'absolute',
    top: 50,
    left: Spacing.base,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingBottom: Spacing.xxl },

  coverSection: { position: 'relative', marginBottom: 48 },
  cover: { height: 103, backgroundColor: Colors.primary },
  avatarWrap: { position: 'absolute', bottom: -36, left: Spacing.xl },

  identitySection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  handle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  ctaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  ctaBtn: { flex: 1 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  statDivider: { width: 1, backgroundColor: Colors.border },

  section: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
  },
  sectionContent: { gap: Spacing.sm },
  aboutText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, letterSpacing: 0.5 },
  detailValue: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
});
