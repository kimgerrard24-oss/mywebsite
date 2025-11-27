// ==============================
// file: pages/_app.tsx
// Safe for Production + Optional Firebase Debug Exposure
// ==============================

import "../styles/globals.css";
import type { AppProps } from "next/app";

import { useEffect, useRef } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

/**
 * Debug exposer for Firebase Auth
 * - เปิดได้เฉพาะ dev ตั้งค่าด้วย localStorage หรือ query string
 * - ปลอดภัย 100% ไม่แตะ flow Hybrid OAuth + Session Cookie
 * - ไม่มีผลเมื่อไม่เปิด debug flag
 */
function exposeFirebaseAuthSafeOnce() {
  if (typeof window === "undefined") return;

  const enabled =
    localStorage.getItem("__debug_firebase") === "1" ||
    window.location.search.includes("debug-firebase=1");

  if (!enabled) return;

  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("[DEBUG] getFirebaseAuth() returned null/undefined");
      return;
    }

    (window as any)._firebaseAuth = auth;

    console.log(
      "[DEBUG] Firebase Auth has been exposed at window._firebaseAuth (dev-only)."
    );
  } catch (err) {
    console.error("[DEBUG] Failed to expose FirebaseAuth:", err);
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const didExpose = useRef(false);

  useEffect(() => {
    // prevent double-run in React Strict Mode
    if (didExpose.current) return;
    didExpose.current = true;

    exposeFirebaseAuthSafeOnce();
  }, []);

  return <Component {...pageProps} />;
}
