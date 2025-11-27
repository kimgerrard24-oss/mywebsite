// ==============================
// file: src/lib/firebase.ts
// ==============================

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? undefined,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Client-side warning
if (typeof window !== "undefined") {
  const required: Array<keyof FirebaseConfig> = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ];

  for (const k of required) {
    if (!firebaseConfig[k]) {
      console.error(
        `Firebase client config missing: NEXT_PUBLIC_FIREBASE_${String(
          k
        ).toUpperCase()}`
      );
    }
  }
}

// Create Firebase app safely
function createFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Handle race-condition in Next.js 16 hydration
  try {
    const existing = getApps();
    if (existing.length > 0) {
      try {
        return getApp();
      } catch {
        // fallback: continue to initialize new app
      }
    }
  } catch {
    // continue to initialize new app
  }

  // Must have required config for Firebase Auth
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    return null;
  }

  try {
    return initializeApp(firebaseConfig as any);
  } catch {
    return null;
  }
}

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() cannot run on SSR");
  }

  if (!firebaseApp) {
    firebaseApp = createFirebaseApp();
    if (!firebaseApp) {
      throw new Error("Firebase app instance failed to initialize");
    }
  }

  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}
