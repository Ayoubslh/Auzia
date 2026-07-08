import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../supabase/client';
import { showAvatarPicker, uploadAvatar } from '../../utils/imagePicker';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import countriesData from '../../mock/countries.json';
import { getCityCoordinates } from '../../utils/cityCoordinates';
import { PHONE_CODES, type PhoneCode } from '../../utils/phoneCodes';

const COUNTRY_OPTIONS = countriesData.map((c) => ({
  label: c.country,
  value: c.country,
  icon: c.flag,
}));

const CODE_OPTIONS = PHONE_CODES.map((c) => ({
  label: `${c.label} (${c.code})`,
  value: c.flag,
  icon: c.flag,
}));

export default function ReqInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateProfile } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCode, setSelectedCode] = useState<PhoneCode>(PHONE_CODES[0]);
  const [codePickerOpen, setCodePickerOpen] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  const selectedCountry = countriesData.find((c) => c.country === country);
  const cityOptions = selectedCountry
    ? selectedCountry.cities.map((c) => ({ label: c, value: c }))
    : [];

  const canProceed = !!(firstName.trim() && lastName.trim() && nickname.trim() && country.trim() && city.trim() && phone.trim());

  // Pre-fill phone from register step (stored in Supabase auth metadata)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const stored = data.user?.user_metadata?.phone_number as string | undefined;
      if (!stored) return;
      const match = PHONE_CODES.find((c) => stored.startsWith(c.code));
      if (match) {
        setSelectedCode(match);
        setPhone(stored.slice(match.code.length));
      } else {
        setPhone(stored);
      }
    });
  }, []);

  const handleCountrySelect = (value: string) => {
    setCountry(value);
    setCity('');
  };

  const handleNext = async () => {
    const flag = countriesData.find((c) => c.country === country)?.flag ?? '';
    const coords = getCityCoordinates(city);
    const initials = `${firstName.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase() || nickname.trim().slice(0, 2).toUpperCase();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let avatarUrl: string | undefined;
      if (localAvatarUri && userId) {
        avatarUrl = await uploadAvatar(userId, localAvatarUri);
      }
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim(),
        countryOfResidence: country,
        countryOfResidenceFlag: flag,
        cityOfResidence: city,
        avatarInitials: initials,
        phoneNumber: `${selectedCode.code}${phone.trim()}`,
        avatar: avatarUrl,
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => showAvatarPicker(setLocalAvatarUri)}
              activeOpacity={0.8}
            >
              {localAvatarUri ? (
                <Image source={{ uri: localAvatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
              )}
              <View style={styles.addBadge}>
                <Ionicons name={localAvatarUri ? 'pencil' : 'add'} size={12} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>{t('onboarding.reqinfo_title')}</Text>

            <View style={styles.nameRow}>
              <Input
                label={t('onboarding.firstname_label')}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('onboarding.firstname_placeholder')}
                autoCapitalize="words"
                containerStyle={styles.nameInput}
              />
              <Input
                label={t('onboarding.lastname_label')}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t('onboarding.lastname_placeholder')}
                autoCapitalize="words"
                containerStyle={styles.nameInput}
              />
            </View>

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

            {/* Phone with country code picker */}
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneLabel}>{t('auth.phone_label')}</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={styles.codeBtn}
                  onPress={() => setCodePickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.codeFlag}>{selectedCode.flag}</Text>
                  <Text style={styles.codeText}>{selectedCode.code}</Text>
                  <Ionicons name="chevron-down" size={13} color={Colors.textTertiary} />
                </TouchableOpacity>
                <View style={styles.phoneDivider} />
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder={t('auth.phone_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
          </View>

          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
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

      <FilterSheet
        visible={codePickerOpen}
        title={t('auth.phone_code_picker_title')}
        options={CODE_OPTIONS}
        value={selectedCode.flag}
        onSelect={(flag) => {
          const found = PHONE_CODES.find((c) => c.flag === flag);
          if (found) setSelectedCode(found);
          setCodePickerOpen(false);
        }}
        onClose={() => setCodePickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, paddingBottom: 100 },

  backBtn: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
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
    overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
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
  nameRow: { flexDirection: 'row', gap: Spacing.sm },
  nameInput: { flex: 1 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {},

  phoneContainer: { gap: Spacing.xs },
  phoneLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    minHeight: 48,
    overflow: 'hidden',
  },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  codeFlag: { fontSize: 18 },
  codeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  phoneDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  phoneInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },

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
  nextText: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.white },
});
