import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { userRepository } from '../repositories/UserRepository';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  completeOnboarding: (userData: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  currentUser: null,
  isLoading: true,

  // ── Restore session on app launch ───────────────────────────────────────────
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let profile: User | null = null;
        try {
          profile = await userRepository.getCurrentUser();
        } catch {
          // profiles table not set up yet — still mark as authenticated
        }
        const hasOnboarded = !!(profile?.cityOfResidence);
        set({ isAuthenticated: true, currentUser: profile, hasCompletedOnboarding: hasOnboarded });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Email / password login ───────────────────────────────────────────────────
  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    let profile: User | null = null;
    try { profile = await userRepository.getCurrentUser(); } catch { /* profile not set up yet */ }
    const hasOnboarded = !!(profile?.cityOfResidence);
    set({ isAuthenticated: true, currentUser: profile, hasCompletedOnboarding: hasOnboarded });
  },

  // ── Google login — session already set by exchangeCodeForSession in the screen
  loginWithGoogle: async () => {
    // getSession() reads from AsyncStorage (no network) — safe right after exchangeCodeForSession
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('No session after Google login');

    const authUser = session.user;

    const fallback: User = {
      id: authUser.id,
      email: authUser.email ?? '',
      nickname: authUser.user_metadata?.full_name ?? '',
      firstName: authUser.user_metadata?.full_name?.split(' ')[0] ?? '',
      lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') ?? '',
      avatar: authUser.user_metadata?.avatar_url ?? undefined,
      avatarInitials: (authUser.email ?? 'AU').slice(0, 2).toUpperCase(),
      avatarColor: '#2E7D32',
      countryOfResidence: '', countryOfResidenceFlag: '',
      cityOfResidence: '', workField: '',
      connectionCount: 0, countriesCount: 0,
      memberSince: new Date().toISOString().slice(0, 7),
      latitude: 0, longitude: 0,
    };

    // Try to fetch the DB profile with a 5-second timeout
    let profile: User = fallback;
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      profile = await Promise.race([userRepository.getCurrentUser(), timeout]);
    } catch {
      // Profile fetch failed or timed out — use fallback from Google metadata
    }

    const hasOnboarded = !!(profile.cityOfResidence);
    set({ isAuthenticated: true, currentUser: profile, hasCompletedOnboarding: hasOnboarded });
  },

  // ── Email registration ───────────────────────────────────────────────────────
  register: async (email, password, phoneNumber) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: phoneNumber ? { data: { phone_number: phoneNumber } } : undefined,
    });
    if (error) throw error;
    if (!data.session) {
      // Email confirmation is enabled in Supabase — user was created but has no active
      // session until they click the confirmation link. Signal this to the caller.
      throw new Error('CONFIRM_EMAIL');
    }
    // Email confirmation is disabled — session is live, proceed straight to onboarding
    let profile: User | null = null;
    try { profile = await userRepository.getCurrentUser(); } catch { /* profile row may lag */ }
    set({ isAuthenticated: true, currentUser: profile, hasCompletedOnboarding: false });
  },

  // ── Logout ───────────────────────────────────────────────────────────────────
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, currentUser: null, hasCompletedOnboarding: false });
  },

  // ── Onboarding completion ────────────────────────────────────────────────────
  completeOnboarding: async (userData: Partial<User>) => {
    const updatedUser = await userRepository.updateCurrentUser(userData);
    set({ hasCompletedOnboarding: true, currentUser: updatedUser });
  },

  // ── Profile update ───────────────────────────────────────────────────────────
  updateProfile: async (data: Partial<User>) => {
    const updatedUser = await userRepository.updateCurrentUser(data);
    set({ currentUser: updatedUser });
  },
}));
