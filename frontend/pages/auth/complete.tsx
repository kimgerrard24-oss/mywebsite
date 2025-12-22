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

    // ต้องรอ query พร้อมจริง ๆ
    const hasQueryToken =
      typeof router.query.customToken === "string" ||
      typeof router.query.token === "string" ||
      typeof router.query.t === "string" ||
      typeof window !== "undefined";

    if (!hasQueryToken && !user) return;

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
        // 2) Read from hash
        // ----------------------------------
        if (!customToken && typeof window !== "undefined" && window.location.hash) {
          const params = new URLSearchParams(
            window.location.hash.substring(1)
          );
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

        const auth = getFirebaseAuth() as Auth | null;
        if (!auth) {
          throw new Error("Firebase auth not initialized");
        }

        await signInWithCustomToken(auth, customToken);

        let firebaseUser: User | null = auth.currentUser;

        if (!firebaseUser) {
          await new Promise<void>((resolve, reject) => {
            const unsub = auth.onAuthStateChanged((u) => {
              if (!u) return;
              firebaseUser = u;
              unsub();
              resolve();
            });

            // safety timeout
            setTimeout(() => {
              unsub();
              reject(new Error("Firebase user resolve timeout"));
            }, 5000);
          });
        }

        if (!firebaseUser) {
          throw new Error("Firebase user not resolved");
        }

        const idToken = await firebaseUser.getIdToken(true);

        // ----------------------------------
        // 4) Create backend session
        // ----------------------------------
        setStatus("SETTING_SESSION");
        setMessage("กำลังสร้าง session cookie...");

        await api.post("/auth/complete", { idToken });

        if (cancelled) return;

        // ----------------------------------
        // 5) Sync user state
        // ----------------------------------
        await refreshUser();

        if (cancelled) return;

        // ----------------------------------
        // 6) Clean URL + redirect
        // ----------------------------------
        setStatus("DONE");
        setMessage("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าแรก...");

        router.replace(REDIRECT_AFTER_LOGIN);
      } catch (err) {
        console.error("[auth/complete]", err);

        if (!cancelled) {
          setStatus("ERROR");
          setMessage("เกิดข้อผิดพลาดระหว่างสร้าง session");
          setDetails(err);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    router.isReady,
    router.query,
    loading,
    user,
    refreshUser,
    router,
  ]);

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

    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        py-6
        sm:p-6
        bg-linear-to-br
        from-slate-100
        via-white
        to-slate-200
      "
    >
      <section
        role="status"
        aria-live="polite"
        className="
          w-full
          max-w-sm
          sm:max-w-md
          lg:max-w-lg
          rounded-xl
          sm:rounded-2xl
          border
          border-gray-200
          bg-white/80
          backdrop-blur-xl
          p-6
          sm:p-8
          lg:p-10
          text-center
          shadow-xl
          sm:shadow-2xl
        "
      >
        <div
          className="
            mb-5
            sm:mb-6
            flex
            justify-center
          "
          aria-hidden="true"
        >
          {StatusIcon}
        </div>

        <h1
          className="
            mb-3
            sm:mb-4
            text-xl
            sm:text-2xl
            md:text-3xl
            font-bold
            text-gray-800
          "
        >
          กำลังดำเนินการเข้าสู่ระบบ
        </h1>

        <p
          className="
            mb-5
            sm:mb-6
            text-sm
            sm:text-base
            md:text-lg
            text-gray-600
          "
        >
          {message}
        </p>

        {status !== 'DONE' && details && (
          <pre
            className="
              mt-2
              max-h-64
              overflow-x-auto
              overflow-y-auto
              rounded-lg
              sm:rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-3
              sm:p-4
              text-left
              text-[11px]
              sm:text-xs
              md:text-sm
              text-gray-700
            "
          >
            {JSON.stringify(details, null, 2)}
          </pre>
        )}

        {status === 'ERROR' && (
          <div className="mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => (window.location.href = `${SITE_URL}/login`)}
              className="
                inline-flex
                w-full
                sm:w-auto
                items-center
                justify-center
                rounded-lg
                sm:rounded-xl
                bg-red-600
                px-5
                sm:px-6
                py-2.5
                sm:py-3
                text-sm
                sm:text-base
                font-medium
                text-white
                transition-colors
                hover:bg-red-700
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
                focus-visible:ring-offset-2
              "
            >
              กลับไปหน้าล็อกอิน
            </button>
          </div>
        )}
      </section>
    </main>
  </>
);

}
