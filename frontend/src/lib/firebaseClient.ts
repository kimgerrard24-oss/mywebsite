// ==============================
// file: lib/firebaseClient.ts
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

// Prevent parallel initialization
let initializing = false;

// Helper: clean env values
function clean(value?: string) {
  return value && value.trim().length > 0 ? value : undefined;
}

function createFirebase(): void {
  if (typeof window === "undefined") return;

  if (initializing) return;
  initializing = true;

  try {
    const config = {
      apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      authDomain: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      projectId: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
      messagingSenderId: clean(
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ),
      appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    };

    // Required config for Firebase Auth
    const required = ["apiKey", "authDomain", "projectId", "appId"] as const;

    for (const k of required) {
      if (!config[k]) {
        initializing = false;
        throw new Error(
          `Firebase client config missing: NEXT_PUBLIC_FIREBASE_${String(k).toUpperCase()}`
        );
      }
    }

    // Prevent getApps() race-condition
    let existing = [];
    try {
      existing = getApps();
    } catch {
      existing = [];
    }

    if (existing.length === 0) {
      appInstance = initializeApp(config as any);
    } else {
      try {
        appInstance = getApp();
      } catch {
        appInstance = initializeApp(config as any);
      }
    }

    authInstance = getAuth(appInstance);
    authInstance.useDeviceLanguage();
  } catch (err) {
    console.error("Firebase initialization error:", err);

    appInstance = null;
    authInstance = null;
  } finally {
    initializing = false;
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() cannot run on SSR");
  }

  if (!appInstance) {
    createFirebase();
  }

  if (!appInstance) {
    throw new Error("Firebase app not initialized (client)");
  }

  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth() cannot run on SSR");
  }

  if (!authInstance) {
    createFirebase();
  }

  if (!authInstance) {
    throw new Error("Firebase auth not initialized (client)");
  }

  return authInstance;
}
