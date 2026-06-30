import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';

const FAQ_KEYS = [
  { qKey: 'help.q1', aKey: 'help.a1' },
  { qKey: 'help.q2', aKey: 'help.a2' },
  { qKey: 'help.q3', aKey: 'help.a3' },
  { qKey: 'help.q4', aKey: 'help.a4' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('help.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.faq_section')}</Text>
          <View style={styles.sectionCard}>
            {FAQ_KEYS.map((faq, i) => (
              <View key={faq.qKey}>
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => setOpenIndex(openIndex === i ? null : i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{t(faq.qKey)}</Text>
                  <Ionicons
                    name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
                {openIndex === i && <Text style={styles.faqAnswer}>{t(faq.aKey)}</Text>}
                {i < FAQ_KEYS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.contact_section')}</Text>
          <View style={styles.sectionCard}>
            <ActionRow
              icon="mail-outline"
              label={t('help.send_email')}
              subtitle={t('help.email')}
              onPress={() => Linking.openURL('mailto:support@auzia.com')}
            />
            <View style={styles.divider} />
            <ActionRow
              icon="alert-circle-outline"
              label={t('help.report_issue')}
              subtitle={t('help.report_desc')}
              onPress={() => Linking.openURL('mailto:support@auzia.com?subject=Signalement')}
            />
          </View>
        </View>

        <Text style={styles.version}>{t('help.version')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const ActionRow: React.FC<{
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
}> = ({ icon, label, subtitle, onPress }) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },

  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginLeft: Spacing.xs,
  },
  sectionCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, ...Shadow.sm },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.base },

  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
  },
  faqQuestion: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  faqAnswer: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  actionSubtitle: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },

  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.sm },
});
