import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../supabase/client';
import { Button } from '../../components/ui/Button';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { useAuthStore } from '../../store/authStore';
import { PHONE_CODES, type PhoneCode } from '../../utils/phoneCodes';
import { requireConnection } from '../../utils/network';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

const CODE_OPTIONS = PHONE_CODES.map((c) => ({
  label: `${c.label} (${c.code})`,
  value: c.flag,
  icon: c.flag,
}));

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCode, setSelectedCode] = useState<PhoneCode>(PHONE_CODES[0]);
  const [codePickerOpen, setCodePickerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.includes('@')) next.email = t('auth.error_invalid_email');
    if (password.length < 8) next.password = t('auth.error_password_short');
    if (password !== confirmPassword) next.confirm = t('auth.error_passwords_mismatch');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (!(await requireConnection('Pas de connexion internet'))) return;
    setLoading(true);
    const fullPhone = phone.trim() ? `${selectedCode.code}${phone.trim()}` : undefined;
    try {
      await register(email, password, fullPhone);
      router.replace('/onboarding/welcome' as any);
    } catch (e: any) {
      if (e.message === 'CONFIRM_EMAIL') {
        Alert.alert(
          t('auth.check_email_title'),
          t('auth.check_email_message'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(t('auth.error_title'), e.message ?? t('auth.error_register_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!(await requireConnection('Pas de connexion internet'))) return;
    const redirectUrl = Linking.createURL('auth/callback');
    try {
      setLoading(true);
      await WebBrowser.warmUpAsync();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('No OAuth URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type !== 'success') return;

      const parsed = Linking.parse(result.url);
      const code = parsed.queryParams?.code as string | undefined;
      if (!code) throw new Error('No authorization code in redirect URL');

      router.replace(`/auth/callback?code=${encodeURIComponent(code)}` as any);
    } catch (e: any) {
      Alert.alert('Erreur Google', e.message ?? 'Inscription Google échouée');
    } finally {
      await WebBrowser.coolDownAsync();
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <View style={styles.container}>

          {/* Compact header: back + inline branding */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.brand}>
              <View style={styles.logoCircle}>
                <Ionicons name="earth" size={20} color={Colors.white} />
              </View>
              <Text style={styles.appName}>Auzia</Text>
            </View>
            {/* Spacer to center the brand */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.formTop}>
              <Text style={styles.title}>{t('auth.register_title')}</Text>
              <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>

              {/* Google register */}
              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleLabel}>{t('auth.google_register')}</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>{t('auth.or_email')}</Text>
                <View style={styles.divLine} />
              </View>

              {/* Email */}
              <View style={[styles.inputField, errors.email ? styles.inputError : undefined]}>
                <Ionicons name="mail-outline" size={17} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={t('auth.email_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {/* Password */}
              <View style={[styles.inputField, errors.password ? styles.inputError : undefined]}>
                <Ionicons name="lock-closed-outline" size={17} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  placeholder={t('auth.error_min_chars')}
                  placeholderTextColor={Colors.textTertiary}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={17}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm password */}
              <View style={[styles.inputField, errors.confirm ? styles.inputError : undefined]}>
                <Ionicons name="shield-checkmark-outline" size={17} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  value={confirmPassword}
                  onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
                  secureTextEntry={!showConfirm}
                  placeholder={t('auth.confirm_password_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                />
                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                    size={17}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Phone with country code */}
              <View style={styles.inputField}>
                <TouchableOpacity
                  style={styles.codeBtn}
                  onPress={() => setCodePickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.codeFlag}>{selectedCode.flag}</Text>
                  <Text style={styles.codeText}>{selectedCode.code}</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors.textTertiary} />
                </TouchableOpacity>
                <View style={styles.phoneSep} />
                <TextInput
                  style={[styles.inputText, { paddingLeft: Spacing.sm }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder={t('auth.phone_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {/* Terms */}
              <Text style={styles.terms}>
                {t('auth.terms_prefix')}
                <Text style={styles.termsLink}>{t('auth.terms_link')}</Text>
                {t('auth.terms_and')}
                <Text style={styles.termsLink}>{t('auth.privacy_link')}</Text>.
              </Text>
            </View>

            {/* Bottom actions */}
            <View style={styles.formBottom}>
              <Button
                label={t('auth.create_my_account')}
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('auth.already_account')}</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.switchLink}>{t('auth.sign_in_link')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

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
  kav: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.xl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  headerSpacer: { width: 40 },

  form: { flex: 1, justifyContent: 'space-between', paddingBottom: Spacing.base },
  formTop: { gap: Spacing.sm },

  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  googleG: { fontSize: 16, fontWeight: FontWeight.bold, color: Colors.google },
  googleLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: FontSize.xs, color: Colors.textTertiary },

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
  },
  inputError: { borderColor: Colors.error },
  inputIcon: { marginRight: Spacing.sm },
  inputText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  eyeBtn: { padding: Spacing.xs },

  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeFlag: { fontSize: 16 },
  codeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  phoneSep: { width: 1, height: 24, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },

  terms: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 17,
  },
  termsLink: { color: Colors.primary, fontWeight: FontWeight.medium },

  formBottom: { gap: Spacing.md },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  switchLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  switchLink: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
