import '../global.css';
import { useEffect, useState, Component, type ReactNode } from 'react';
import { I18nManager, Text, View, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastHost } from '../components/ui/Toast';
import i18n, { LANGUAGE_KEY, SUPPORTED_LANGUAGES, type Language } from '../utils/i18n';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';

export const unstable_settings = {
  initialRouteName: 'index',
};

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginTop: 60 }}>
            Crash — {(this.state.error as Error).message}
          </Text>
          <Text style={{ fontSize: 12, color: '#333', marginTop: 12, fontFamily: 'monospace' }}>
            {(this.state.error as Error).stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then(async (stored) => {
      const lang = (stored && SUPPORTED_LANGUAGES.includes(stored as Language)
        ? stored
        : 'fr') as Language;
      const shouldBeRTL = lang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
      }
      i18n.changeLanguage(lang);
      useLanguageStore.setState({ language: lang });
      await restoreSession();
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <ErrorBoundary>
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="help" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="user/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <ToastHost />
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}
