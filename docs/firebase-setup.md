# Firebase setup (Milestone 2)

## Console

1. [Firebase Console](https://console.firebase.google.com/) → Create project (or use existing).
2. **Build → Authentication → Sign-in method**
   - Enable **Google**
   - Enable **Anonymous** (guest login)
3. **Build → Firestore Database** → Create database (production mode), pick a region.
4. **Project settings → Your apps** → Add **Web app** → copy config into `client/.env`.

## Environment (`client/.env`)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firestore rules

Deploy rules from `docs/firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

Or paste into **Firestore → Rules** in the console.

## Authorized domains (production)

After Vercel deploy, add your Vercel domain under **Authentication → Settings → Authorized domains**.

## Google OAuth

If popup is blocked, allow popups for localhost / your domain. For custom domains, configure OAuth consent screen in Google Cloud (linked to Firebase).
