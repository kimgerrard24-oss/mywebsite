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

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? undefined,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Warn missing keys (client-side only)
if (typeof window !== "undefined") {
  const required: Array<keyof FirebaseConfig> = ["apiKey", "authDomain", "projectId", "appId"];
  for (const k of required) {
    if (!firebaseConfig[k]) {
      console.error(
        `Firebase client config missing: NEXT_PUBLIC_FIREBASE_${String(k).toUpperCase()}`
      );
    }
  }
}

function createFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  try {
    if (getApps().length === 0) {
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
        console.error(
          "Firebase initialization aborted: missing required NEXT_PUBLIC_FIREBASE_* values"
        );
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

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  if (_firebaseApp === undefined) {
    _firebaseApp = createFirebaseApp();
  }
  return _firebaseApp ?? null;
}

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

export default getFirebaseApp();
