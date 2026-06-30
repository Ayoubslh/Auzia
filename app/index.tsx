import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme';

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  if (!hasCompletedOnboarding) return <Redirect href="/onboarding/welcome" />;
  return <Redirect href="/(tabs)/diaspora" />;
}
