import type { PlayerProfileStats } from '@online-uno/shared';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

import { getFirebaseDb } from './app';

const USERS_COLLECTION = 'users';

function timestampToIso(value: Timestamp | string | undefined): string {
  if (!value) return new Date(0).toISOString();
  if (typeof value === 'string') return value;
  return value.toDate().toISOString();
}

function mapUserDoc(uid: string, data: Record<string, unknown>): PlayerProfileStats {
  const gamesPlayed = Number(data.gamesPlayed ?? 0);
  const gamesWon = Number(data.gamesWon ?? 0);
  return {
    uid,
    displayName: String(data.displayName ?? 'Player'),
    photoURL: data.photoURL ? String(data.photoURL) : null,
    gamesPlayed,
    gamesWon,
    winPercentage: Number(data.winPercentage ?? 0),
    totalScore: Number(data.totalScore ?? 0),
    isGuest: Boolean(data.isGuest),
    createdAt: timestampToIso(data.createdAt as Timestamp | string | undefined),
    updatedAt: timestampToIso(data.updatedAt as Timestamp | string | undefined),
  };
}

export async function fetchUserProfile(uid: string): Promise<PlayerProfileStats | null> {
  const snap = await getDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return mapUserDoc(uid, snap.data());
}

export async function ensureUserProfile(
  user: User,
  displayName: string,
): Promise<PlayerProfileStats> {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const profile = mapUserDoc(user.uid, existing.data());
    const photoURL = user.photoURL ?? profile.photoURL;
    const name = displayName.trim() || profile.displayName;

    if (name !== profile.displayName || photoURL !== profile.photoURL) {
      await updateDoc(ref, {
        displayName: name,
        photoURL,
        updatedAt: serverTimestamp(),
      });
      return { ...profile, displayName: name, photoURL, updatedAt: new Date().toISOString() };
    }
    return profile;
  }

  const payload = {
    uid: user.uid,
    displayName: displayName.trim() || 'Player',
    photoURL: user.photoURL ?? null,
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    totalScore: 0,
    isGuest: user.isAnonymous,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload);
  return mapUserDoc(user.uid, {
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
