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

// Safe client-only initializer
function createFirebase(): void {
  if (typeof window === "undefined") {
    return; // SSR safe
  }

  if (firebaseApp) return;

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId =
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    // FIX — throw when missing critical values
    if (!apiKey || !authDomain || !projectId || !appId) {
      throw new Error("Missing Firebase environment variables");
    }

    if (getApps().length === 0) {
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
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
    firebaseApp = undefined;
    firebaseAuth = undefined;
    throw err; // FIX — do not silent fail
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
