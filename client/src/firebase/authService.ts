import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';

import { getFirebaseAuth } from './app';
import { ensureUserProfile } from './users';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);
  const name = credential.user.displayName ?? 'Player';
  const profile = await ensureUserProfile(credential.user, name);
  return { user: credential.user, profile };
}

export async function signInAsGuest(displayName: string) {
  const credential = await signInAnonymously(getFirebaseAuth());
  const profile = await ensureUserProfile(credential.user, displayName);
  return { user: credential.user, profile };
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export type AuthUser = User;
