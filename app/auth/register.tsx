import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../supabase/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';


export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register, loginWithGoogle } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    setLoading(true);
    try {
      await register(email, password);
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

      await loginWithGoogle();
      const { hasCompletedOnboarding } = useAuthStore.getState();
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/diaspora');
      } else {
        router.replace('/onboarding/welcome' as any);
      }
    } catch (e: any) {
      Alert.alert('Erreur Google', e.message ?? 'Inscription Google échouée');
    } finally {
      await WebBrowser.coolDownAsync();
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Ionicons name="earth" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>Auzia</Text>
            <Text style={styles.appSubtitle}>{t('auth.tagline')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.greeting}>{t('auth.register_title')}</Text>
            <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleLabel}>{t('auth.google_register')}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or_email')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Input
              label={t('auth.email_label')}
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('auth.email_placeholder')}
              error={errors.email}
              containerStyle={styles.inputContainer}
            />

            <Input
              label={t('auth.password_label')}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              secureToggle
              placeholder={t('auth.error_min_chars')}
              error={errors.password}
              containerStyle={styles.inputContainer}
            />

            <Input
              label={t('auth.confirm_password_label')}
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
              secureToggle
              placeholder={t('auth.confirm_password_placeholder')}
              error={errors.confirm}
              containerStyle={styles.inputContainer}
            />

            <Text style={styles.terms}>
              {t('auth.terms_prefix')}
              <Text style={styles.termsLink}>{t('auth.terms_link')}</Text>
              {t('auth.terms_and')}
              <Text style={styles.termsLink}>{t('auth.privacy_link')}</Text>.
            </Text>

            <Button
              label={t('auth.create_my_account')}
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.registerBtn}
            />

            <TouchableOpacity style={styles.loginRow} onPress={() => router.back()}>
              <Text style={styles.loginLabel}>{t('auth.already_account')}</Text>
              <Text style={styles.loginLink}>{t('auth.sign_in_link')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },

  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.xxl,
    left: Spacing.base,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },
  appSubtitle: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.8)' },

  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.base,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.xs,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  googleIcon: { fontSize: 18, fontWeight: FontWeight.bold, color: Colors.google },
  googleLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textTertiary },

  inputContainer: { marginBottom: Spacing.xs },

  terms: { fontSize: FontSize.xs, color: Colors.textTertiary, lineHeight: 18, marginTop: -Spacing.xs },
  termsLink: { color: Colors.primary, fontWeight: FontWeight.medium },

  registerBtn: { marginTop: Spacing.xs },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
  loginLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  loginLink: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
