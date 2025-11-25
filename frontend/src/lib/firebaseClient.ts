// ==============================
// file: lib/firebaseClient.ts
// ==============================

// Safe client-side Firebase initializer for Next.js (fixed)
// - prevents SSR initialization
// - guarantees single initialization
// - safe retry behavior
// ==============================

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let initialized = false;

function createFirebase(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Prevent duplicate init (Next.js refresh/hydration)
  if (initialized) return;
  initialized = true;

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId =
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    if (!apiKey || !authDomain || !projectId || !appId) {
      console.error("Missing NEXT_PUBLIC_FIREBASE_* env variables");
      return;
    }

    const config = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: storageBucket ?? undefined,
      messagingSenderId: messagingSenderId ?? undefined,
      appId,
    };

    // Next.js safe initialization
    if (getApps().length === 0) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    authInstance = getAuth(appInstance);
    authInstance.useDeviceLanguage();
  } catch (err) {
    console.error("Firebase initialization failed:", err);
    appInstance = null;
    authInstance = null;
    initialized = false; // allow retry on next call
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  if (!appInstance) createFirebase();
  return appInstance;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;

  if (!authInstance) createFirebase();
  return authInstance;
}
