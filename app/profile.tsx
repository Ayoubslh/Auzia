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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../components/ui/Avatar';
import { FilterSheet } from '../components/ui/FilterSheet';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';
import type { Language } from '../utils/i18n';

const LANGUAGE_OPTIONS = [
  { label: 'Français', value: 'fr', icon: '🇫🇷' },
  { label: 'English', value: 'en', icon: '🇬🇧' },
  { label: 'العربية', value: 'ar', icon: '🇩🇿' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { currentUser, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);

  if (!currentUser) return null;

  const openLinkedin = () => {
    const url = currentUser.linkedin!.startsWith('http')
      ? currentUser.linkedin!
      : `https://${currentUser.linkedin}`;
    Linking.openURL(url);
  };

  const openInstagram = () => {
    const handle = currentUser.instagram!.replace('@', '');
    Linking.openURL(`https://instagram.com/${handle}`);
  };

  const currentLangLabel = LANGUAGE_OPTIONS.find((l) => l.value === language);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.coverHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.xxl + insets.bottom }]}
      >
        <View style={styles.coverSection}>
          <View style={styles.cover} />
          <View style={styles.avatarWrap}>
            <Avatar
              initials={currentUser.avatarInitials}
              color={currentUser.avatarColor}
              size={72}
              showBorder
            />
          </View>
        </View>

        <View style={styles.identity}>
          <Text style={styles.name}>
            {currentUser.firstName} {currentUser.lastName}{' '}
            {currentUser.countryOfResidenceFlag}
          </Text>
          <Text style={styles.handle}>
            @{currentUser.nickname} · {currentUser.status} · {currentUser.cityOfResidence}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatItem value={currentUser.connectionCount} label={t('profile.stat_connections')} />
          <View style={styles.statDivider} />
          <StatItem value={currentUser.countriesCount} label={t('profile.stat_countries')} />
          <View style={styles.statDivider} />
          <StatItem value={currentUser.memberSince} label={t('profile.stat_since')} />
        </View>

        {currentUser.aboutMe && (
          <Section title={t('profile.about_section')}>
            <Text style={styles.aboutText}>{currentUser.aboutMe}</Text>
          </Section>
        )}

        <Section title={t('profile.info_section')}>
          <DetailRow icon="briefcase-outline" label={t('profile.field_domain')} value={currentUser.workField} />
          <DetailRow
            icon="earth-outline"
            label={t('profile.field_origin')}
            value={`${currentUser.countryOfOrigin} ${currentUser.countryOfOriginFlag}`}
          />
          <DetailRow
            icon="location-outline"
            label={t('profile.field_residence')}
            value={`${currentUser.cityOfResidence}, ${currentUser.countryOfResidence}`}
          />
          {currentUser.phoneNumber && (
            <DetailRow icon="call-outline" label={t('profile.field_phone')} value={currentUser.phoneNumber} />
          )}
        </Section>

        {(currentUser.linkedin || currentUser.instagram) && (
          <View style={styles.socialRow}>
            {currentUser.linkedin && (
              <TouchableOpacity
                style={[styles.socialBtn, styles.linkedinBtn]}
                onPress={openLinkedin}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
                <Text style={[styles.socialText, { color: '#0A66C2' }]}>LinkedIn</Text>
              </TouchableOpacity>
            )}
            {currentUser.instagram && (
              <TouchableOpacity
                style={[styles.socialBtn, styles.instagramBtn]}
                onPress={openInstagram}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-instagram" size={18} color="#E1306C" />
                <Text style={[styles.socialText, { color: '#E1306C' }]}>Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.settingsCard}>
          <SettingsRow
            icon="language-outline"
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            title={t('profile.language_setting')}
            subtitle={`${currentLangLabel?.icon} ${currentLangLabel?.label}`}
            onPress={() => setLanguageSheetOpen(true)}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconBg={Colors.primaryLight}
            iconColor={Colors.primary}
            title={t('profile.privacy_setting')}
            subtitle={t('profile.privacy_setting_sub')}
            onPress={() => router.push('/privacy' as any)}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="help-circle-outline"
            iconBg={Colors.badgeBlueBg}
            iconColor={Colors.badgeBlue}
            title={t('profile.help_setting')}
            subtitle={t('profile.help_setting_sub')}
            onPress={() => router.push('/help' as any)}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            router.replace('/auth/login' as any);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <FilterSheet
        visible={languageSheetOpen}
        title={t('language.choose_language')}
        options={LANGUAGE_OPTIONS}
        value={language}
        onSelect={(val) => {
          setLanguage(val as Language);
          setLanguageSheetOpen(false);
        }}
        onClose={() => setLanguageSheetOpen(false)}
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
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const SettingsRow: React.FC<{
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}> = ({ icon, iconBg, iconColor, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.settingsIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <View style={styles.settingsText}>
      <Text style={styles.settingsTitle}>{title}</Text>
      <Text style={styles.settingsSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  coverHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingBottom: Spacing.xxl },

  coverSection: { position: 'relative', marginBottom: 48 },
  cover: { height: 140, backgroundColor: Colors.primary },
  avatarWrap: { position: 'absolute', bottom: -36, left: Spacing.xl },

  identity: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: 4,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  handle: { fontSize: FontSize.sm, color: Colors.textSecondary },

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
    ...Shadow.sm,
    gap: Spacing.sm,
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
  detailText: { flex: 1 },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },

  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.full,
  },
  linkedinBtn: { backgroundColor: '#EFF6FF' },
  instagramBtn: { backgroundColor: '#FFF0F5' },
  socialText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  settingsCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.base + 32 + Spacing.md,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: { flex: 1 },
  settingsTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  settingsSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 1,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: FontSize.base,
    color: Colors.error,
    fontWeight: FontWeight.semibold,
  },
});
