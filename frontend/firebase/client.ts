// ==============================
// files frontend/firebase/client 
// ==============================

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Singleton instances
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

// Prevent parallel init race
let initializing = false;

// Validate and clean environment values
function clean(value?: string) {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

// ==============================
// Core initialization
// ==============================
function initFirebase(): void {
  if (typeof window === "undefined") return; // SSR safe

  if (initializing) return;
  initializing = true;

  try {
    const config = {
      apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      authDomain: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      projectId: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
      messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
      appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    };

    // Important required keys
    const required = ["apiKey", "authDomain", "projectId", "appId"] as const;

    for (const k of required) {
      if (!config[k]) {
        initializing = false;
        throw new Error(
          `Firebase missing config: NEXT_PUBLIC_FIREBASE_${String(k).toUpperCase()}`
        );
      }
    }

    // Check existing instance
    const existing = getApps();
    if (existing.length > 0) {
      try {
        appInstance = getApp();
      } catch {
        appInstance = initializeApp(config as any);
      }
    } else {
      appInstance = initializeApp(config as any);
    }

    // Auth singleton
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

// ==============================
// Public accessors
// ==============================
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() cannot run on SSR");
  }

  if (!appInstance) initFirebase();

  if (!appInstance) {
    throw new Error("Firebase app not initialized");
  }

  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth() cannot run on SSR");
  }

  if (!authInstance) initFirebase();

  if (!authInstance) {
    throw new Error("Firebase auth not initialized");
  }

  return authInstance;
}
