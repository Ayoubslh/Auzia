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
import { useAuthStore } from '../../store/authStore';
import { requireConnection } from '../../utils/network';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();
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

      // Exchange here — before any navigation — PKCE flow state in AsyncStorage
      // is only valid while still in the same JS context as signInWithOAuth.
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;

      const { loginWithGoogle } = useAuthStore.getState();
      await loginWithGoogle();
      const { hasCompletedOnboarding } = useAuthStore.getState();
      router.replace(hasCompletedOnboarding ? '/(tabs)/diaspora' : '/onboarding/welcome' as any);
    } catch (e: any) {
      Alert.alert('Erreur Google', e.message ?? 'Connexion Google échouée');
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
          <View style={styles.bubble2} />
          <View style={styles.logoCircle}>
            <Ionicons name="earth" size={32} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Auzia</Text>
          <Text style={styles.tagline}>{t('auth.tagline')}</Text>
        </View>

        {/* ── Card ── */}
        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
          <View style={styles.formTop}>
            <View style={styles.formHeading}>
              <Text style={styles.title}>{t('auth.login_title')}</Text>
              <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleLabel}>{t('auth.google_signin')}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>{t('auth.or_email')}</Text>
              <View style={styles.divLine} />
            </View>

            <View style={styles.inputField}>
              <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />
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

            <View style={styles.inputField}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.inputText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder={t('auth.password_placeholder')}
                placeholderTextColor={Colors.textTertiary}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
              <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>
          </View>

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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Colors.primary },
  kav: { flex: 1 },

  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    gap: 6,
    overflow: 'hidden',
  },
  bubble1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -70,
    right: -50,
  },
  bubble2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -10,
    left: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
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

  formTop: { gap: Spacing.md },
  formHeading: { gap: 4 },

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
    height: 48,
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
  divText: { fontSize: FontSize.xs, color: Colors.textTertiary, letterSpacing: 0.3 },

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
  },
  inputText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  formBottom: { gap: Spacing.md, marginTop: Spacing.xl },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  switchLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  switchLink: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
