// ==============================
// lib/firebaseClient.ts
// ==============================

import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// หาก ENV หาย จะป้องกัน Firebase crash
function validateFirebaseConfig(cfg: Record<string, string>) {
  for (const k in cfg) {
    if (!cfg[k]) {
      console.warn(`Firebase config missing: ${k}`);
      // ยัง initialize ได้ แต่แจ้งเตือนให้รู้ปัญหา
    }
  }
}

validateFirebaseConfig(firebaseConfig);

const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export default firebaseApp;
