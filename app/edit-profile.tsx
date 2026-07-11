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
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { FilterSheet } from '../components/ui/FilterSheet';
import { useAuthStore } from '../store/authStore';
import { PHONE_CODES, type PhoneCode } from '../utils/phoneCodes';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import countriesData from '../mock/countries.json';

const COUNTRY_OPTIONS = countriesData.map((c) => ({ label: c.country, value: c.country, icon: c.flag }));
const CODE_OPTIONS = PHONE_CODES.map((c) => ({
  label: `${c.label} (${c.code})`,
  value: c.flag,
  icon: c.flag,
}));

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
  "En recherche d'emploi",
  'Retraité(e)',
];

function parsePhone(full?: string): { code: PhoneCode; number: string } {
  const defaultCode = PHONE_CODES[0];
  if (!full) return { code: defaultCode, number: '' };
  const match = PHONE_CODES.find((c) => full.startsWith(c.code));
  if (match) return { code: match, number: full.slice(match.code.length) };
  return { code: defaultCode, number: full };
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile } = useAuthStore();

  if (!currentUser) return null;

  const parsed = parsePhone(currentUser.phoneNumber);

  const isDomainPreset = DOMAIN_OPTIONS.includes(currentUser.workField ?? '');
  const isStatusPreset = STATUS_OPTIONS.includes(currentUser.status ?? '');

  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [nickname, setNickname] = useState(currentUser.nickname ?? '');
  const [aboutMe, setAboutMe] = useState(currentUser.aboutMe ?? '');

  const [domainSelection, setDomainSelection] = useState(isDomainPreset ? currentUser.workField! : 'Autre');
  const [domainOther, setDomainOther] = useState(isDomainPreset ? '' : (currentUser.workField ?? ''));

  const [statusSelection, setStatusSelection] = useState(isStatusPreset ? currentUser.status! : (currentUser.status ? 'Autre' : ''));
  const [statusOther, setStatusOther] = useState(isStatusPreset ? '' : (currentUser.status ?? ''));

  const [country, setCountry] = useState(currentUser.countryOfResidence);
  const [city, setCity] = useState(currentUser.cityOfResidence);

  const [phone, setPhone] = useState(parsed.number);
  const [selectedCode, setSelectedCode] = useState<PhoneCode>(parsed.code);
  const [codePickerOpen, setCodePickerOpen] = useState(false);

  const [linkedin, setLinkedin] = useState(currentUser.linkedin ?? '');
  const [instagram, setInstagram] = useState(currentUser.instagram ?? '');

  const [saving, setSaving] = useState(false);

  const selectedCountry = countriesData.find((c) => c.country === country);
  const cityOptions = selectedCountry
    ? selectedCountry.cities.map((c) => ({ label: c, value: c }))
    : [];

  const domain = domainSelection === 'Autre' ? domainOther.trim() : domainSelection;
  const status = statusSelection === 'Autre' ? statusOther.trim() : statusSelection;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont requis.');
      return;
    }
    const fullPhone = phone.trim() ? `${selectedCode.code}${phone.trim()}` : undefined;
    const countryFlag = countriesData.find((c) => c.country === country)?.flag ?? currentUser.countryOfResidenceFlag;
    const initials = `${firstName.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase();

    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim(),
        aboutMe: aboutMe.trim(),
        workField: domain,
        status: status || undefined,
        countryOfResidence: country,
        countryOfResidenceFlag: countryFlag,
        cityOfResidence: city,
        phoneNumber: fullPhone,
        linkedin: linkedin.trim() || undefined,
        instagram: instagram.trim() || undefined,
        avatarInitials: initials,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de sauvegarder le profil');
    } finally {
      setSaving(false);
    }
  };

  const toggleDomain = (opt: string) => setDomainSelection((p) => (p === opt ? '' : opt));
  const toggleStatus = (opt: string) => setStatusSelection((p) => (p === opt ? '' : opt));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>{saving ? '…' : 'Enregistrer'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <SectionHead label="IDENTITÉ" />
          <View style={styles.nameRow}>
            <Input
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              containerStyle={styles.nameInput}
            />
            <Input
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              containerStyle={styles.nameInput}
            />
          </View>
          <Input
            label="Pseudonyme"
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            containerStyle={styles.field}
          />
          <Input
            label="À propos de moi"
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            numberOfLines={3}
            containerStyle={styles.field}
            style={styles.textarea}
          />

          {/* Location */}
          <SectionHead label="LOCALISATION" />
          <Select
            label="Pays de résidence"
            value={country}
            onSelect={(v) => { setCountry(v); setCity(''); }}
            options={COUNTRY_OPTIONS}
            placeholder="Choisir un pays"
            containerStyle={styles.field}
          />
          <Select
            label="Ville"
            value={city}
            onSelect={setCity}
            options={cityOptions}
            placeholder={country ? 'Choisir une ville' : 'Choisir un pays d\'abord'}
            disabled={!country}
            containerStyle={styles.field}
          />

          {/* Domain */}
          <SectionHead label="DOMAINE" />
          <View style={styles.chips}>
            {DOMAIN_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, domainSelection === opt && styles.chipActive]}
                onPress={() => toggleDomain(opt)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, domainSelection === opt && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, domainSelection === 'Autre' && styles.chipActive]}
              onPress={() => toggleDomain('Autre')}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, domainSelection === 'Autre' && styles.chipTextActive]}>Autre…</Text>
            </TouchableOpacity>
          </View>
          {domainSelection === 'Autre' && (
            <TextInput
              style={styles.otherInput}
              value={domainOther}
              onChangeText={setDomainOther}
              placeholder="Précisez votre domaine..."
              placeholderTextColor={Colors.textTertiary}
            />
          )}

          {/* Status */}
          <SectionHead label="SITUATION" />
          <View style={styles.chips}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, statusSelection === opt && styles.chipActive]}
                onPress={() => toggleStatus(opt)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, statusSelection === opt && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, statusSelection === 'Autre' && styles.chipActive]}
              onPress={() => toggleStatus('Autre')}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, statusSelection === 'Autre' && styles.chipTextActive]}>Autre…</Text>
            </TouchableOpacity>
          </View>
          {statusSelection === 'Autre' && (
            <TextInput
              style={styles.otherInput}
              value={statusOther}
              onChangeText={setStatusOther}
              placeholder="Précisez votre situation..."
              placeholderTextColor={Colors.textTertiary}
            />
          )}

          {/* Phone */}
          <SectionHead label="TÉLÉPHONE" />
          <View style={styles.phoneRow}>
            <TouchableOpacity style={styles.codeBtn} onPress={() => setCodePickerOpen(true)} activeOpacity={0.7}>
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
              placeholder="Numéro de téléphone"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {/* Social */}
          <SectionHead label="RÉSEAUX SOCIAUX" />
          <Input
            label="LinkedIn"
            value={linkedin}
            onChangeText={setLinkedin}
            autoCapitalize="none"
            placeholder="URL ou nom d'utilisateur"
            containerStyle={styles.field}
          />
          <Input
            label="Instagram"
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
            placeholder="@nomutilisateur"
            containerStyle={styles.field}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <FilterSheet
        visible={codePickerOpen}
        title="Indicatif téléphonique"
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

const SectionHead: React.FC<{ label: string }> = ({ label }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  saveBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },

  scroll: { padding: Spacing.xl, paddingBottom: 60, gap: Spacing.sm },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },

  nameRow: { flexDirection: 'row', gap: Spacing.sm },
  nameInput: { flex: 1 },
  field: {},
  textarea: {
    minHeight: 80,
    ...Platform.select({ android: { textAlignVertical: 'top' as const } }),
    paddingTop: Spacing.sm,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },

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
  codeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  codeFlag: { fontSize: 18 },
  codeText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  phoneDivider: { width: 1, height: 26, backgroundColor: Colors.border },
  phoneInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
});
