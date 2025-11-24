// lib/firebaseClient.ts
// Safe client-side Firebase initializer for Next.js (no null returns)

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;

function createFirebase(): void {
  if (typeof window === "undefined") {
    // SSR: do nothing
    return;
  }

  if (!appInstance) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
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

    // FIXED: safer initialization for Next.js 16
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }

    authInstance = getAuth(appInstance);
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) createFirebase();
  if (!appInstance) throw new Error("Firebase app not initialized");
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) createFirebase();
  if (!authInstance) throw new Error("Firebase auth not initialized");
  return authInstance;
}
