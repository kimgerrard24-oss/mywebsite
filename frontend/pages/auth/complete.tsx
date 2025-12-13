// ==============================
// file: pages/auth/complete.tsx
// ==============================

import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "@/lib/api/api";
import { getFirebaseAuth } from "firebase/client";
import { signInWithCustomToken, Auth, User } from "firebase/auth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

type Status = "LOADING" | "FIREBASE_LOGIN" | "SETTING_SESSION" | "DONE" | "ERROR";

export default function AuthCompletePage() {
  const router = useRouter();
  const { refreshUser, user, loading } = useAuthContext();

  const hasRunRef = useRef(false);

  const [status, setStatus] = useState<Status>("LOADING");
  const [message, setMessage] = useState("กำลังตรวจสอบข้อมูลจาก OAuth...");
  const [details, setDetails] = useState<any>(null);

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  const REDIRECT_AFTER_LOGIN = "/feed";

  useEffect(() => {
    if (!router.isReady) return;
    if (loading) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // ถ้ามี session อยู่แล้ว → redirect ทันที
    if (user) {
      router.replace(REDIRECT_AFTER_LOGIN);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        let customToken: string | null = null;

        // ----------------------------------
        // 1) Read customToken from query
        // ----------------------------------
        if (typeof router.query.customToken === "string") {
          customToken = router.query.customToken;
        } else if (typeof router.query.token === "string") {
          customToken = router.query.token;
        } else if (typeof router.query.t === "string") {
          customToken = router.query.t;
        }

        // ----------------------------------
        // 2) Read from hash (OAuth providers)
        // ----------------------------------
        if (!customToken && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.substring(1));
          const hashToken = params.get("customToken");
          if (hashToken) {
            customToken = hashToken;
          }
        }

        if (!customToken) {
          setStatus("ERROR");
          setMessage("ไม่พบ customToken จาก OAuth callback");
          return;
        }

        // ----------------------------------
        // 3) Firebase sign-in
        // ----------------------------------
        setStatus("FIREBASE_LOGIN");
        setMessage("กำลังเข้าสู่ระบบด้วย Firebase...");

        const auth = getFirebaseAuth() as Auth;
        await signInWithCustomToken(auth, customToken);

        let firebaseUser: User | null = auth.currentUser;

        if (!firebaseUser) {
          await new Promise<void>((resolve) => {
            const unsub = auth.onAuthStateChanged((u) => {
              if (!u) return;
              firebaseUser = u;
              unsub();
              resolve();
            });
          });
        }

        if (!firebaseUser) {
          throw new Error("Firebase user not resolved");
        }

        const idToken = await firebaseUser.getIdToken(true);

        // ----------------------------------
        // 4) Create backend session (JWT + Redis)
        // ----------------------------------
        setStatus("SETTING_SESSION");
        setMessage("กำลังสร้าง session cookie...");

        await api.post(
          "/auth/complete",
          { idToken },
          { withCredentials: true }
        );

        if (cancelled) return;

        // ----------------------------------
        // 5) Sync user state (single source of truth)
        // ----------------------------------
        await refreshUser();

        if (cancelled) return;

        // ----------------------------------
        // 6) Done → redirect
        // ----------------------------------
        setStatus("DONE");
        setMessage("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าแรก...");

        setTimeout(() => {
          if (!cancelled) {
            router.replace(REDIRECT_AFTER_LOGIN);
          }
        }, 300);
      } catch (err) {
        console.error("[auth/complete]", err);

        if (!cancelled) {
          setStatus("ERROR");
          setMessage("เกิดข้อผิดพลาดระหว่างสร้าง session");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, loading]);

  const StatusIcon =
    status === "DONE" ? (
      <CheckCircle className="w-12 h-12 text-green-600" />
    ) : status === "ERROR" ? (
      <XCircle className="w-12 h-12 text-red-600" />
    ) : (
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
    );

  return (
    <>
      <Head>
        <title>กำลังเข้าสู่ระบบ… | PhlyPhant</title>
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

          {status !== "DONE" && details && (
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
