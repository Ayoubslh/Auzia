import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/AppHeader';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { MOCK_SERVICES, MOCK_PAYMENT_HISTORY } from '../../mock';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { PaymentRecord } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  completed: Colors.success,
  pending: Colors.warning,
  failed: Colors.error,
};

export default function FactureScreen() {
  const { currentUser } = useAuthStore();
  const { conversations } = useMessageStore();
  const { t } = useTranslation();
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader user={currentUser} notificationCount={3} messageCount={totalUnread} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="business-outline" size={28} color={Colors.white} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t('facture.banner_title')}</Text>
            <Text style={styles.bannerDesc}>{t('facture.banner_desc')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('facture.services_section')}</Text>
          <View style={styles.grid}>
            {MOCK_SERVICES.map((svc) => (
              <TouchableOpacity key={svc.id} style={styles.serviceCard} activeOpacity={0.8}>
                <View style={[styles.serviceIcon, { backgroundColor: svc.iconBg }]}>
                  <Ionicons name={svc.icon as any} size={22} color={svc.iconColor} />
                </View>
                <Text style={styles.serviceTitle}>{svc.title}</Text>
                <Text style={styles.serviceSubtitle}>{svc.subtitle}</Text>
                <View style={styles.serviceChevron}>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('facture.history_section')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t('common.see_all')}</Text>
            </TouchableOpacity>
          </View>
          {MOCK_PAYMENT_HISTORY.map((record) => (
            <PaymentRow key={record.id} record={record} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PaymentRow: React.FC<{ record: PaymentRecord }> = ({ record }) => (
  <View style={prStyles.row}>
    <View style={prStyles.iconCircle}>
      <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
    </View>
    <View style={prStyles.info}>
      <Text style={prStyles.service}>{record.service}</Text>
      <Text style={prStyles.desc}>{record.description}</Text>
    </View>
    <View style={prStyles.right}>
      <Text style={prStyles.amount}>
        {record.amount.toLocaleString()} {record.currency}
      </Text>
      <Text style={prStyles.date}>{record.date}</Text>
    </View>
    <View style={[prStyles.statusDot, { backgroundColor: STATUS_COLOR[record.status] }]} />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: Spacing.xxl },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    margin: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  bannerDesc: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    lineHeight: 18,
  },

  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  serviceTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  serviceSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  serviceChevron: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
});

const prStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  service: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  desc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  date: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
