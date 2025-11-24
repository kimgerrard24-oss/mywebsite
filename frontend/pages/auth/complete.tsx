// pages/auth/complete.tsx
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { signInWithCustomToken } from "firebase/auth";

import { getFirebaseApp, getFirebaseAuth } from "@/lib/firebaseClient";

export default function AuthComplete() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const oneTimeKey = router.query.one_time_key as string | undefined;

      if (!oneTimeKey) {
        router.replace("/login?error=missing_key");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/auth/custom_token?key=${encodeURIComponent(
            oneTimeKey
          )}`,
          { method: "GET", credentials: "include" }
        );

        const data = await res.json();

        if (!data?.customToken) {
          router.replace("/login?error=missing_token");
          return;
        }

        const app = getFirebaseApp();
        if (!app) {
          router.replace("/login?error=firebase_not_initialized");
          return;
        }

        const auth = getFirebaseAuth();
        await signInWithCustomToken(auth, data.customToken);

        router.replace("/");
      } catch (err) {
        console.error("complete-login-error:", err);
        router.replace("/login?error=signin_failed");
      }
    };

    if (router.isReady) run();
  }, [router]);

  return (
    <>
      <Head>
        <title>กำลังเข้าสู่ระบบ… | Phlyphant</title>
        <meta
          name="description"
          content="กำลังเข้าสู่ระบบเพื่อเข้าสู่ประสบการณ์ Social Media ของคุณบน Phlyphant"
        />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100 px-4">
        <section className="text-center max-w-md w-full p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            กำลังเข้าสู่ระบบ
          </h1>

          <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed">
            ระบบกำลังตรวจสอบข้อมูล และพาคุณเข้าสู่บัญชีของคุณ…
          </p>

          <div className="flex justify-center">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </section>

        <footer className="mt-8 text-center text-gray-500 text-sm md:text-base">
          © {new Date().getFullYear()} Phlyphant — All Rights Reserved
        </footer>
      </main>
    </>
  );
}
