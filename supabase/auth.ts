import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from './client';

// Required so the browser closes after OAuth redirect on Android
WebBrowser.maybeCompleteAuthSession();

// ── Email / password ──────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Profile row is created automatically by the handle_new_user trigger
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Call useGoogleAuth() inside your login screen component.
// The returned promptAsync() opens the browser; the session is set automatically.

export function useGoogleAuth() {
  const redirectUri = makeRedirectUri({ scheme: 'auzia' });   // matches app.json scheme

  const [_request, _response, promptAsync] = Google.useAuthRequest({
    // Paste your Google Client IDs from Google Cloud Console
    // (one per platform; see step 3 in the guide below)
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  const signInWithGoogle = async () => {
    const result = await promptAsync();
    if (result.type !== 'success') return null;

    const { id_token } = result.params;
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    });
    if (error) throw error;
    // Profile row created by trigger; if user already exists, trigger is skipped (ON CONFLICT DO NOTHING)
    return data.user;
  };

  return { signInWithGoogle };
}

// ── Session listener (call once at app root) ──────────────────────────────────
// Returns an unsubscribe function.
export function onAuthStateChange(callback: (userId: string | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });
  return () => subscription.unsubscribe();
}
