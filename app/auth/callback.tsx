import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabase/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

export default function CallbackScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const { show: showToast } = useToastStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current || !code) {
      if (!code) {
        showToast('Connexion annulée');
        router.replace('/auth/login' as any);
      }
      return;
    }
    processed.current = true;

    (async () => {
      try {
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
        showToast(e?.message ?? 'Connexion Google échouée');
        router.replace('/auth/login' as any);
      }
    })();
  }, [code]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>A</Text>
        </View>
        <ActivityIndicator size="large" color={Colors.white} style={styles.spinner} />
        <Text style={styles.title}>Connexion en cours…</Text>
        <Text style={styles.subtitle}>Veuillez patienter quelques secondes</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  spinner: { marginVertical: Spacing.sm },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
});
