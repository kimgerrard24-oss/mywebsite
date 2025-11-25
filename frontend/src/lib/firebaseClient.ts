// ==============================
// file: lib/firebaseClient.ts
// ==============================

// Safe client-side Firebase initializer for Next.js (fixed)
// - prevents SSR initialization
// - guarantees correct retry logic
// - ensures getFirebaseAuth() never returns null silently
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

// control initialization but allow retry if failed
let initializing = false;

function createFirebase(): void {
  if (typeof window === "undefined") return;

  // prevent simultaneous double-init
  if (initializing) return;
  initializing = true;

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId =
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    if (!apiKey || !authDomain || !projectId || !appId) {
      throw new Error("Missing required NEXT_PUBLIC_FIREBASE_* env variables");
    }

    const config = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: storageBucket ?? undefined,
      messagingSenderId: messagingSenderId ?? undefined,
      appId,
    };

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

    // allow retry next time
    initializing = false;
    return;
  }

  // init success
  initializing = false;
}

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() cannot run on SSR");
  }

  if (!appInstance) createFirebase();
  if (!appInstance) {
    throw new Error("Firebase app not initialized (client)");
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth() cannot run on SSR");
  }

  if (!authInstance) createFirebase();
  if (!authInstance) {
    throw new Error("Firebase auth not initialized (client)");
  }
  return authInstance;
}
