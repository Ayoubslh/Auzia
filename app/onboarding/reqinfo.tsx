import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import countriesData from '../../mock/countries.json';
import { getCityCoordinates } from '../../utils/cityCoordinates';

const COUNTRY_OPTIONS = countriesData.map((c) => ({
  label: c.country,
  value: c.country,
  icon: c.flag,
}));

export default function ReqInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateProfile } = useAuthStore();
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const selectedCountry = countriesData.find((c) => c.country === country);
  const cityOptions = selectedCountry
    ? selectedCountry.cities.map((c) => ({ label: c, value: c }))
    : [];

  const canProceed = nickname.trim() && country.trim() && city.trim();

  const handleCountrySelect = (value: string) => {
    setCountry(value);
    setCity('');
  };

  const handleNext = async () => {
    const flag = countriesData.find((c) => c.country === country)?.flag ?? '';
    const coords = getCityCoordinates(city);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        countryOfResidence: country,
        countryOfResidenceFlag: flag,
        cityOfResidence: city,
        avatarInitials: nickname.trim().slice(0, 2).toUpperCase(),
        ...(coords ?? {}),
      });
      router.push('/onboarding/optinfo' as any);
    } catch (e: any) {
      Alert.alert(t('auth.error_title'), e.message ?? t('auth.error_register_failed'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
              <View style={styles.addBadge}>
                <Ionicons name="add" size={12} color={Colors.white} />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>{t('onboarding.reqinfo_title')}</Text>

            <Input
              label={t('onboarding.pseudo_label')}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t('onboarding.pseudo_placeholder')}
              autoCapitalize="none"
              containerStyle={styles.input}
            />
            <Select
              label={t('onboarding.country_label')}
              value={country}
              onSelect={handleCountrySelect}
              options={COUNTRY_OPTIONS}
              placeholder={t('onboarding.country_placeholder')}
              containerStyle={styles.input}
            />
            <Select
              label={t('onboarding.city_label')}
              value={city}
              onSelect={setCity}
              options={cityOptions}
              placeholder={country ? t('onboarding.city_placeholder') : t('onboarding.choose_country_first')}
              disabled={!country}
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, paddingBottom: 100 },

  backBtn: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarSection: { alignItems: 'center', paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  formSection: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {},

  dots: { flexDirection: 'row', gap: 6, marginTop: Spacing.xl, alignSelf: 'center' },
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
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.white },
});
