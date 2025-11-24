// ==============================
// file: pages/auth/complete.tsx
// OAuth Callback → Set Firebase Session → Redirect
// ==============================

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "@/lib/axios";
import { getFirebaseAuth } from "firebase/client";
import { signInWithCustomToken } from "firebase/auth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Status = "LOADING" | "SETTING_SESSION" | "DONE" | "ERROR";

export default function AuthCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("LOADING");
  const [message, setMessage] = useState<string>("กำลังตรวจสอบข้อมูลจาก OAuth...");
  const [details, setDetails] = useState<any>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "https://api.phlyphant.com";
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://phlyphant.com";

  // ================================
  // STEP 1 — Fetch custom token from backend (one-time key)
  // ================================
  useEffect(() => {
    const run = async () => {
      try {
        const { key } = router.query;
        if (!key || typeof key !== "string") {
          setStatus("ERROR");
          setMessage("Missing OAuth key parameter");
          return;
        }

        setMessage("กำลังโหลดข้อมูลเข้าสู่ระบบ...");
        const tokenRes = await axios.get(`${API_BASE}/auth/custom_token?key=${key}`, {
          withCredentials: true,
        });

        const customToken = tokenRes.data?.customToken;
        if (!customToken) {
          setStatus("ERROR");
          setMessage("ไม่พบข้อมูล Custom Token หรือหมดอายุแล้ว");
          return;
        }

        // ================================
        // STEP 2 — Sign in with Firebase
        // ================================
        setStatus("SETTING_SESSION");
        setMessage("กำลังเข้าสู่ระบบด้วย Firebase...");

        const auth = getFirebaseAuth();
        if (!auth) {
          setStatus("ERROR");
          setMessage("Firebase auth not initialized");
          return;
        }

        await signInWithCustomToken(auth, customToken);
        const user = auth.currentUser;
        if (!user) {
          setStatus("ERROR");
          setMessage("ไม่สามารถเข้าสู่ระบบด้วย Firebase ได้");
          return;
        }

        const idToken = await user.getIdToken(true);

        // ================================
        // STEP 3 — Send idToken to backend → Create Session Cookie
        // ================================
        setMessage("กำลังสร้าง session cookie...");
        await axios.post(
          `${API_BASE}/auth/create_session`,
          { idToken },
          { withCredentials: true }
        );

        // ================================
        // STEP 4 — Final session-check
        // ================================
        const final = await axios.get(`${API_BASE}/auth/session-check`, {
          withCredentials: true,
        });

        setDetails(final.data);

        if (final.data?.valid === true || final.data?.sessionCookie === true) {
          setStatus("DONE");
          setMessage("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าแรก...");
          setTimeout(() => router.push("/"), 1200);
        } else {
          setStatus("ERROR");
          setMessage("Session cookie สร้างไม่สำเร็จ");
        }
      } catch (err) {
        console.error(err);
        setStatus("ERROR");
        setMessage("เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ");
      }
    };

    if (router.isReady) run();
  }, [router]);

  // ================================
  // UI Icons
  // ================================
  const StatusIcon =
    status === "DONE" ? (
      <CheckCircle className="w-12 h-12 text-green-600" />
    ) : status === "ERROR" ? (
      <XCircle className="w-12 h-12 text-red-600" />
    ) : (
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
    );

  // ================================
  // Render
  // ================================
  return (
    <>
      <Head>
        <title>Completing Login… | PhlyPhant</title>
        <meta
          name="description"
          content="Completing secure login using Hybrid OAuth and Firebase Authentication."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-slate-100 via-white to-slate-200">
        <section
          className="
            max-w-lg w-full 
            bg-white/80 backdrop-blur-xl 
            shadow-2xl rounded-2xl border 
            p-8 sm:p-10
            text-center
          "
        >
          <div className="flex justify-center mb-6">{StatusIcon}</div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            กำลังดำเนินการเข้าสู่ระบบ
          </h1>

          <p className="text-gray-600 text-base sm:text-lg mb-6">{message}</p>

          {details && (
            <pre className="text-left text-xs sm:text-sm bg-gray-50 p-4 rounded-xl border overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}

          {status === "ERROR" && (
            <button
              onClick={() => (window.location.href = `${SITE_URL}/login`)}
              className="
                mt-6 px-6 py-3 
                bg-red-600 text-white 
                rounded-xl font-medium 
                hover:bg-red-700 
                transition-all
              "
            >
              กลับไปหน้าล็อกอิน
            </button>
          )}
        </section>
      </main>
    </>
  );
}
