// ==============================
// file: pages/auth/complete.tsx
// OAuth Callback → Create Firebase Session Cookie
// ==============================

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "@/lib/axios";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { signInWithCustomToken, Auth } from "firebase/auth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Status = "LOADING" | "FIREBASE_LOGIN" | "SETTING_SESSION" | "DONE" | "ERROR";

export default function AuthCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("LOADING");
  const [message, setMessage] = useState("กำลังตรวจสอบข้อมูลจาก OAuth...");
  const [details, setDetails] = useState<any>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "https://api.phlyphant.com";

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  // เปลี่ยนจาก /home → /dashboard ตามคำขอ
  const REDIRECT_AFTER_LOGIN = "/feed";

  useEffect(() => {
    if (!router.isReady) return;

    const run = async () => {
      try {
        const { customToken } = router.query;

        if (!customToken || typeof customToken !== "string") {
          setStatus("ERROR");
          setMessage("ไม่พบ customToken จาก OAuth callback");
          return;
        }

        setStatus("FIREBASE_LOGIN");
        setMessage("กำลังเข้าสู่ระบบด้วย Firebase...");

        const auth = getFirebaseAuth() as Auth;
        await signInWithCustomToken(auth, customToken);

        const user = auth.currentUser;
        if (!user) {
          setStatus("ERROR");
          setMessage("ไม่สามารถเข้าสู่ระบบ Firebase ได้");
          return;
        }

        const idToken = await user.getIdToken(true);

        setStatus("SETTING_SESSION");
        setMessage("กำลังสร้าง session cookie...");

        await axios.post(
          `${API_BASE}/auth/complete`,
          { idToken },
          { withCredentials: true }
        );

        const verify = await axios.get(`${API_BASE}/auth/session-check`, {
          withCredentials: true,
        });

        setDetails(verify.data);

        if (verify.data?.valid === true) {
          setStatus("DONE");
          setMessage("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าแรก...");

          // ***** จุดแก้ไขตามคำสั่งของคุณ *****
          setTimeout(() => {
            router.replace(REDIRECT_AFTER_LOGIN);
          }, 1000);

        } else {
          setStatus("ERROR");
          setMessage("Session cookie ไม่ถูกสร้าง");
        }
      } catch (err) {
        console.error(err);
        setStatus("ERROR");
        setMessage("เกิดข้อผิดพลาดระหว่างสร้าง session");
      }
    };

    run();
  }, [router]);

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
