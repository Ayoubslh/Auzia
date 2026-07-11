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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

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

      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;

      const { loginWithGoogle } = useAuthStore.getState();
      await loginWithGoogle();
      const { hasCompletedOnboarding } = useAuthStore.getState();
      router.replace(hasCompletedOnboarding ? '/(tabs)/diaspora' : '/onboarding/welcome' as any);
    } catch (e: any) {
      Alert.alert('Erreur Google', e.message ?? 'Inscription Google échouée');
    } finally {
      await WebBrowser.coolDownAsync();
      setLoading(false);
    }
  };

  return (
    <View style={[styles.outer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.bubble1} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.heroBrand}>
            <View style={styles.logoCircle}>
              <Ionicons name="earth" size={20} color={Colors.white} />
            </View>
            <Text style={styles.appName}>Auzia</Text>
          </View>
        </View>

        {/* ── Card ── */}
        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
          <View style={styles.formTop}>
            <View style={styles.formHeading}>
              <Text style={styles.title}>{t('auth.register_title')}</Text>
              <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleLabel}>{t('auth.google_register')}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>{t('auth.or_email')}</Text>
              <View style={styles.divLine} />
            </View>

            {/* Email */}
            <View style={[styles.inputField, errors.email ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={17} color={errors.email ? Colors.error : Colors.textTertiary} />
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
            <View style={[styles.inputField, errors.password ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={17} color={errors.password ? Colors.error : Colors.textTertiary} />
              <TextInput
                style={styles.inputText}
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                secureTextEntry={!showPassword}
                placeholder={t('auth.error_min_chars')}
                placeholderTextColor={Colors.textTertiary}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={17} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Confirm */}
            <View style={[styles.inputField, errors.confirm ? styles.inputError : null]}>
              <Ionicons name="shield-checkmark-outline" size={17} color={errors.confirm ? Colors.error : Colors.textTertiary} />
              <TextInput
                style={styles.inputText}
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
                secureTextEntry={!showConfirm}
                placeholder={t('auth.confirm_password_placeholder')}
                placeholderTextColor={Colors.textTertiary}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={17} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Phone */}
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

            <Text style={styles.terms}>
              {t('auth.terms_prefix')}
              <Text style={styles.termsLink}>{t('auth.terms_link')}</Text>
              {t('auth.terms_and')}
              <Text style={styles.termsLink}>{t('auth.privacy_link')}</Text>.
            </Text>
          </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Colors.primary },
  kav: { flex: 1 },

  hero: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
    overflow: 'hidden',
  },
  bubble1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -30,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },

  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 8,
  },

  formTop: { gap: Spacing.sm },
  formHeading: { gap: 3, marginBottom: 4 },

  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 46,
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
  divText: { fontSize: FontSize.xs, color: Colors.textTertiary, letterSpacing: 0.3 },

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
  },
  inputError: { borderColor: Colors.error, backgroundColor: '#FEF2F2' },
  inputText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  codeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  codeFlag: { fontSize: 16 },
  codeText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  phoneSep: { width: 1, height: 22, backgroundColor: Colors.border },

  terms: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    lineHeight: 17,
  },
  termsLink: { color: Colors.primary, fontWeight: FontWeight.medium },

  formBottom: { gap: Spacing.md, marginTop: Spacing.lg },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  switchLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  switchLink: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
