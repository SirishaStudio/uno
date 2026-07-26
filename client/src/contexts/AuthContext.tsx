import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PlayerProfileStats } from '@online-uno/shared';
import { onAuthStateChanged, type User } from 'firebase/auth';

import {
  fetchUserProfile,
  getFirebaseAuth,
  isFirebaseConfigured,
  signInAsGuest,
  signInWithGoogle,
  signOutUser,
} from '@/firebase';

interface AuthContextValue {
  user: User | null;
  profile: PlayerProfileStats | null;
  loading: boolean;
  authError: string | null;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setLoading(true);
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const doc = await fetchUserProfile(nextUser.uid);
        setProfile(doc);
      } catch {
        setProfile(null);
        setAuthError('Could not load your profile.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isConfigured]);

  const handleGoogleSignIn = useCallback(async () => {
    setAuthError(null);
    try {
      const { profile: nextProfile } = await signInWithGoogle();
      setProfile(nextProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(message);
      throw err;
    }
  }, []);

  const handleGuestSignIn = useCallback(async (displayName: string) => {
    setAuthError(null);
    try {
      const { profile: nextProfile } = await signInAsGuest(displayName);
      setProfile(nextProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Guest sign-in failed.';
      setAuthError(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    await signOutUser();
    setProfile(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      authError,
      isConfigured,
      signInWithGoogle: handleGoogleSignIn,
      signInAsGuest: handleGuestSignIn,
      signOut,
      clearAuthError,
    }),
    [
      user,
      profile,
      loading,
      authError,
      isConfigured,
      handleGoogleSignIn,
      handleGuestSignIn,
      signOut,
      clearAuthError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
