// ==============================
// file: src/lib/firebase.ts
// ==============================
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

// Load config from NEXT_PUBLIC_* env (client-safe values only)
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? undefined,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Only report missing config on client (avoid leaking or throwing during SSR)
if (typeof window !== "undefined") {
  const required: Array<keyof FirebaseConfig> = ["apiKey", "authDomain", "projectId", "appId"];
  for (const k of required) {
    if (!firebaseConfig[k]) {
      // Use console.error for visibility in browser devtools; do not throw here
      console.error(`Firebase client config missing: NEXT_PUBLIC_FIREBASE_${String(k).toUpperCase()}`);
    }
  }
}

// Create app only on client and ensure singleton
function createFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    // Do not initialize Firebase on the server
    return null;
  }

  try {
    if (getApps().length === 0) {
      // Defensive: require minimal keys before initializing
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
        console.error("Firebase initialization aborted: missing required NEXT_PUBLIC_FIREBASE_* values");
        return null;
      }
      return initializeApp(firebaseConfig as any);
    }
    return getApp();
  } catch (err) {
    console.error("Firebase initialization error:", err);
    return null;
  }
}

let _firebaseApp: FirebaseApp | null | undefined = undefined;

/**
 * Returns the singleton FirebaseApp when available on client, or null on SSR / error.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  if (_firebaseApp === undefined) {
    _firebaseApp = createFirebaseApp();
  }

  return _firebaseApp ?? null;
}

/**
 * Returns firebase Auth instance when available (client), otherwise null.
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.error("getFirebaseAuth error:", err);
    return null;
  }
}

// Default export kept for backward compatibility with existing imports.
// This exports the current app instance (may be null during SSR or if config missing)
export default getFirebaseApp();
