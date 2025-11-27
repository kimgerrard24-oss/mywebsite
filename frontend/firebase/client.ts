// ==============================
// file: frontend/lib/firebaseClient.ts
// Safe Firebase initialization for Next.js 16
// ==============================

import {
  initializeApp,
  getApps,
  type FirebaseApp,
  getApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;

// Helper — clean env (prevent empty string errors)
function clean(value?: string) {
  return value && value.trim().length > 0 ? value : undefined;
}

// Safe client-only initializer
function createFirebase(): void {
  if (typeof window === "undefined") {
    return; // SSR safe
  }

  if (firebaseApp) return;

  try {
    if (getApps().length === 0) {
      const apiKey = clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      const authDomain = clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
      const projectId = clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
      const storageBucket = clean(
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      );
      const messagingSenderId = clean(
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      );
      const appId = clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

      // FIX — do not throw, just fail silently (prevent hydration crash)
      if (!apiKey || !authDomain || !projectId || !appId) {
        return;
      }

      firebaseApp = initializeApp({
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      });
    } else {
      firebaseApp = getApp();
    }

    firebaseAuth = getAuth(firebaseApp);
    firebaseAuth.useDeviceLanguage();
  } catch {
    firebaseApp = undefined;
    firebaseAuth = undefined;
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() cannot run on SSR");
  }

  if (!firebaseApp) {
    createFirebase();
  }

  if (!firebaseApp) {
    throw new Error("Firebase app not initialized");
  }

  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth() cannot run on SSR");
  }

  if (!firebaseAuth) {
    createFirebase();
  }

  if (!firebaseAuth) {
    throw new Error("Firebase auth not initialized");
  }

  return firebaseAuth;
}
