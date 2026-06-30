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
import { supabase } from '../../supabase/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';


export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login, loginWithGoogle } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
      router.replace('/(tabs)/diaspora');
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'Auzia://auth/callback', skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('No OAuth URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, 'Auzia://auth/callback');
      if (result.type !== 'success') return;

      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (sessionError) throw sessionError;

      await loginWithGoogle();
      router.replace('/(tabs)/diaspora');
    } catch (e: any) {
      Alert.alert('Erreur Google', e.message ?? 'Connexion Google échouée');
    } finally {
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
            <View style={styles.logoCircle}>
              <Ionicons name="earth" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>Auzia</Text>
            <Text style={styles.appSubtitle}>{t('auth.tagline')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.greeting}>{t('auth.login_title')}</Text>
            <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleLabel}>{t('auth.google_signin')}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or_email')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Input
              label={t('auth.email_label')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('auth.email_placeholder')}
              containerStyle={styles.inputContainer}
            />

            <Input
              label={t('auth.password_label')}
              value={password}
              onChangeText={setPassword}
              secureToggle
              placeholder={t('auth.password_placeholder')}
              containerStyle={styles.inputContainer}
            />

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>

            <Button
              label={t('auth.sign_in')}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.loginBtn}
            />

            <TouchableOpacity
              style={styles.createRow}
              onPress={() => router.push('/auth/register' as any)}
            >
              <Text style={styles.createLabel}>{t('auth.no_account')}</Text>
              <Text style={styles.createLink}>{t('auth.create_account')}</Text>
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

  forgotRow: { alignItems: 'flex-end', marginTop: -Spacing.xs },
  forgotText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  loginBtn: { marginTop: Spacing.xs },

  createRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
  createLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  createLink: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
