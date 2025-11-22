// frontend/firebase/client.ts
// Firebase v9 modular SDK initialization (TypeScript)
// Reads config from NEXT_PUBLIC_FIREBASE_* env variables
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function initFirebase(): { app: FirebaseApp; auth: Auth } {
  if (typeof window === 'undefined') {
    throw new Error('Firebase must be initialized in the browser');
  }

  if (getApps().length === 0) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    if (!apiKey || !authDomain || !projectId || !appId) {
      // Fail fast with clear message for production environment
      throw new Error(
        'Missing NEXT_PUBLIC_FIREBASE_* environment variables. Please set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_APP_ID'
      );
    }

    const config = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: storageBucket ?? undefined,
      messagingSenderId: messagingSenderId ?? undefined,
      appId,
    };

    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    // Recommended: do not enable persistence on SSR build step
  }

  return { app: firebaseApp as FirebaseApp, auth: firebaseAuth as Auth };
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    const initialized = initFirebase();
    return initialized.auth;
  }
  return firebaseAuth;
}

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    const initialized = initFirebase();
    return initialized.app;
  }
  return firebaseApp;
}
