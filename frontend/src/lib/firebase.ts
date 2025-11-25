// ==============================
// file: src/lib/firebase.ts
// ==============================
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
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

// Warn only on client
if (typeof window !== "undefined") {
  const required: Array<keyof FirebaseConfig> = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ];

  for (const k of required) {
    if (!firebaseConfig[k]) {
      console.error(
        `Firebase client config missing: NEXT_PUBLIC_FIREBASE_${String(
          k
        ).toUpperCase()}`
      );
    }
  }
}

function createFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase cannot be initialized on server");
  }

  if (getApps().length > 0) {
    return getApp();
  }

  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error(
      "Firebase initialization aborted: missing required NEXT_PUBLIC_FIREBASE_*"
    );
  }

  return initializeApp(firebaseConfig as any);
}

// Strict, guaranteed instance
let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp() cannot run on SSR");
  }

  if (!firebaseApp) {
    firebaseApp = createFirebaseApp();
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

export default {};
