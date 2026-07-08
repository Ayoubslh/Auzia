import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';

const FEATURE_KEYS = [
  { icon: 'earth-outline' as const, titleKey: 'onboarding.feature_diaspora_title', descKey: 'onboarding.feature_diaspora_desc' },
  { icon: 'storefront-outline' as const, titleKey: 'onboarding.feature_products_title', descKey: 'onboarding.feature_products_desc' },
  { icon: 'card-outline' as const, titleKey: 'onboarding.feature_payments_title', descKey: 'onboarding.feature_payments_desc' },
  { icon: 'gift-outline' as const, titleKey: 'onboarding.feature_gifts_title', descKey: 'onboarding.feature_gifts_desc' },
  { icon: 'megaphone-outline' as const, titleKey: 'onboarding.feature_announces_title', descKey: 'onboarding.feature_announces_desc' },
];

export default function FeaturesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.push('/onboarding/reqinfo' as any)}
      >
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('onboarding.features_title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.features_subtitle')}</Text>

        <View style={styles.featureList}>
          {FEATURE_KEYS.map((f) => (
            <View key={f.titleKey} style={styles.featureRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={f.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
                <Text style={styles.featureDesc}>{t(f.descKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => router.push('/onboarding/reqinfo' as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.nextText}>{t('common.next')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  backBtn: {
    position: 'absolute',
    top: 56,
    left: Spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  skipBtn: { position: 'absolute', top: 56, right: Spacing.xl, zIndex: 10 },
  skipText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium },

  content: { flex: 1 },
  contentInner: { paddingHorizontal: Spacing.xl, paddingTop: 96, paddingBottom: Spacing.xl, gap: Spacing.md },

  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22, marginTop: -Spacing.xs },

  featureList: { gap: Spacing.base, marginTop: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  featureDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  dots: { flexDirection: 'row', gap: 6, marginTop: Spacing.lg, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { width: 20, backgroundColor: Colors.primary },

  nextBtn: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.white },
});
