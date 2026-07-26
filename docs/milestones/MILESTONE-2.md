# Milestone 2 — Authentication

## Completed

- Firebase Web SDK (Auth + Firestore)
- Google sign-in (popup)
- Guest sign-in (Anonymous + display name modal)
- Firestore `users/{uid}` profile create/sync
- `AuthContext` + `useAuth`
- `ProtectedRoute` for app pages
- Splash redirects logged-in users to home
- Profile page shows stats from Firestore
- Sign out from lobby
- Firestore security rules (client cannot change stats)
- Shared `PlayerProfileStats` extended with photo, guest flag, timestamps

## How to test

### Prerequisites

1. Complete [firebase-setup.md](../firebase-setup.md).
2. From repo root:

```powershell
npm install
Copy-Item client\.env.example client\.env
# Fill Firebase keys in client\.env
npm run dev
```

### Google login

1. Open `http://localhost:5173` → splash → login.
2. Click **Continue with Google**, complete popup.
3. **Expected:** Redirect to lobby with your name; Profile shows avatar and zero stats.

### Guest login

1. Sign out from lobby.
2. **Play as Guest** → enter name (2–16 chars) → Continue.
3. **Expected:** Lobby shows name with “(guest)”; Profile shows initial letter avatar.

### Route protection

1. Sign out.
2. Visit `http://localhost:5173/home` directly.
3. **Expected:** Redirect to login; after sign-in, return to home.

### Firestore

1. Firebase Console → Firestore → `users` collection.
2. **Expected:** One document per login with fields from PROJECT.md schema.

## Expected results

- Session persists on refresh (Firebase auth persistence).
- Missing Firebase env shows banner on login; buttons disabled.

## Known limitations

- Server does not verify Firebase tokens yet (Milestone 5).
- Guest accounts are device/session based; clearing site data requires new guest login.
- Stats remain 0 until Milestone 9 server updates.
- No email/password provider.

## Suggested commit message

```
feat(auth): add Firebase Google and guest login with Firestore profiles

Wire AuthContext, protected routes, profile UI, and Firestore rules for user documents.
```

## Remaining work

Milestone 3 — Room system (create/join, codes, waiting room, ready flags).

---

**Awaiting approval before Milestone 3.**
