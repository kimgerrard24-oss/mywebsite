// ==============================
// file: frontend/firebase/client.ts
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

// Run only on client
function createFirebase() {
  if (typeof window === "undefined") {
    return;
  }

  if (!firebaseApp) {
    if (getApps().length === 0) {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      const messagingSenderId =
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
      const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

      if (!apiKey || !authDomain || !projectId || !appId) {
        console.error(
          "Firebase initialization aborted: missing NEXT_PUBLIC_FIREBASE_* env"
        );
        return;
      }

      firebaseApp = initializeApp({
        apiKey,
        authDomain,
        projectId,
        storageBucket: storageBucket ?? undefined,
        messagingSenderId: messagingSenderId ?? undefined,
        appId,
      });
    } else {
      firebaseApp = getApp();
    }

    firebaseAuth = getAuth(firebaseApp);
    firebaseAuth.useDeviceLanguage();
  }
}

export function getFirebaseApp(): FirebaseApp | undefined {
  if (!firebaseApp) createFirebase();
  return firebaseApp;
}

export function getFirebaseAuth(): Auth | undefined {
  if (!firebaseAuth) createFirebase();
  return firebaseAuth;
}

// default export (backward compatibility)
export default getFirebaseApp();
