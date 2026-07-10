import { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { useAuthStore } from '../../store/authStore';
import { PHONE_CODES, type PhoneCode } from '../../utils/phoneCodes';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';

const DOMAIN_OPTIONS = [
  'Tech / Informatique',
  'Finance / Banque',
  'Santé / Médecine',
  'Commerce / Business',
  'Éducation / Recherche',
  'Architecture / BTP',
  'Droit / Juridique',
  'Marketing / Comm.',
];

const STATUS_OPTIONS = [
  'Étudiant(e)',
  'En poste',
  'Entrepreneur(e)',
  'En recherche d\'emploi',
  'Retraité(e)',
];

const CODE_OPTIONS = PHONE_CODES.map((c) => ({
  label: `${c.label} (${c.code})`,
  value: c.flag,
  icon: c.flag,
}));

export default function OptInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { completeOnboarding } = useAuthStore();

  const [domainSelection, setDomainSelection] = useState('');
  const [domainOther, setDomainOther] = useState('');
  const [statusSelection, setStatusSelection] = useState('');
  const [statusOther, setStatusOther] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCode, setSelectedCode] = useState<PhoneCode>(PHONE_CODES[0]);
  const [codePickerOpen, setCodePickerOpen] = useState(false);
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');

  const domain = domainSelection === 'Autre' ? domainOther.trim() : domainSelection;
  const status = statusSelection === 'Autre' ? statusOther.trim() : statusSelection;

  const handleJoin = async () => {
    const fullPhone = phone.trim() ? `${selectedCode.code}${phone.trim()}` : undefined;
    try {
      await completeOnboarding({
        workField: domain,
        status,
        linkedin,
        instagram,
        phoneNumber: fullPhone,
      });
      router.replace('/(tabs)/diaspora');
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de finaliser le profil');
    }
  };

  const toggleDomain = (opt: string) => setDomainSelection((prev) => (prev === opt ? '' : opt));
  const toggleStatus = (opt: string) => setStatusSelection((prev) => (prev === opt ? '' : opt));

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
          <View style={styles.header}>
            <Text style={styles.title}>{t('onboarding.optinfo_title')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.optinfo_subtitle')}</Text>
          </View>

          {/* Domain */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('onboarding.domain_label')}</Text>
            <View style={styles.chips}>
              {DOMAIN_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, domainSelection === opt && styles.chipActive]}
                  onPress={() => toggleDomain(opt)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, domainSelection === opt && styles.chipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, domainSelection === 'Autre' && styles.chipActive]}
                onPress={() => toggleDomain('Autre')}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, domainSelection === 'Autre' && styles.chipTextActive]}>
                  Autre…
                </Text>
              </TouchableOpacity>
            </View>
            {domainSelection === 'Autre' && (
              <TextInput
                style={styles.otherInput}
                value={domainOther}
                onChangeText={setDomainOther}
                placeholder="Précisez votre domaine..."
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            )}
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('onboarding.status_label')}</Text>
            <View style={styles.chips}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, statusSelection === opt && styles.chipActive]}
                  onPress={() => toggleStatus(opt)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, statusSelection === opt && styles.chipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, statusSelection === 'Autre' && styles.chipActive]}
                onPress={() => toggleStatus('Autre')}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, statusSelection === 'Autre' && styles.chipTextActive]}>
                  Autre…
                </Text>
              </TouchableOpacity>
            </View>
            {statusSelection === 'Autre' && (
              <TextInput
                style={styles.otherInput}
                value={statusOther}
                onChangeText={setStatusOther}
                placeholder="Précisez votre situation..."
                placeholderTextColor={Colors.textTertiary}
                autoFocus
              />
            )}
          </View>

          {/* Phone */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('auth.phone_label')}</Text>
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

          {/* Social links */}
          <View style={styles.section}>
            <Input
              label={t('onboarding.linkedin_label')}
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder={t('onboarding.linkedin_placeholder')}
              autoCapitalize="none"
            />
            <Input
              label={t('onboarding.instagram_label')}
              value={instagram}
              onChangeText={setInstagram}
              placeholder={t('onboarding.instagram_placeholder')}
              autoCapitalize="none"
              containerStyle={{ marginTop: Spacing.md }}
            />
          </View>

          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleJoin}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85}>
            <Text style={styles.joinText}>{t('onboarding.join_community')}</Text>
          </TouchableOpacity>
        </View>
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
  scroll: { flexGrow: 1, paddingBottom: 120 },

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

  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },

  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },

  otherInput: {
    height: 46,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.primaryLight,
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    minHeight: 50,
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
  codeText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  phoneDivider: { width: 1, height: 26, backgroundColor: Colors.border },
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

  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  skipBtn: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  joinBtn: {
    flex: 2,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.white },
});
