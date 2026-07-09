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
import { useAuthStore } from '../../store/authStore';
import { requireConnection } from '../../utils/network';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!(await requireConnection('Pas de connexion internet'))) return;
    try {
      setLoading(true);
      await login(email, password);
      const { hasCompletedOnboarding } = useAuthStore.getState();
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/diaspora');
      } else {
        router.replace('/onboarding/welcome' as any);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Connexion échouée');
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
      Alert.alert('Erreur Google', e.message ?? 'Connexion Google échouée');
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

          {/* Branding */}
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="earth" size={38} color={Colors.white} />
            </View>
            <Text style={styles.appName}>Auzia</Text>
            <Text style={styles.appTagline}>{t('auth.tagline')}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.formTop}>
              <Text style={styles.title}>{t('auth.login_title')}</Text>
              <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>

              {/* Google sign-in */}
              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleLabel}>{t('auth.google_signin')}</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>{t('auth.or_email')}</Text>
                <View style={styles.divLine} />
              </View>

              {/* Email */}
              <View style={styles.inputField}>
                <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={t('auth.email_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {/* Password */}
              <View style={styles.inputField}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder={t('auth.password_placeholder')}
                  placeholderTextColor={Colors.textTertiary}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom actions */}
            <View style={styles.formBottom}>
              <Button
                label={t('auth.sign_in')}
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('auth.no_account')}</Text>
                <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
                  <Text style={styles.switchLink}>{t('auth.create_account')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  kav: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.xl },

  brand: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  appTagline: { fontSize: FontSize.sm, color: Colors.textTertiary },

  form: { flex: 1, justifyContent: 'space-between', paddingBottom: Spacing.base },
  formTop: { gap: Spacing.md },

  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
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
  googleG: { fontSize: 17, fontWeight: FontWeight.bold, color: Colors.google },
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
  inputIcon: { marginRight: Spacing.sm },
  inputText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  eyeBtn: { padding: Spacing.xs },

  forgotRow: { alignSelf: 'flex-end', marginTop: -Spacing.xs },
  forgotText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  formBottom: { gap: Spacing.md },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  switchLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  switchLink: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
