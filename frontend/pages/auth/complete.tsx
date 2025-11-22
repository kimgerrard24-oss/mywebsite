// ==============================
// file: pages/auth/complete.tsx
// ==============================

// บังคับ SSR เพื่อไม่ให้ Next.js ทำเป็น Static
export const getServerSideProps = async () => {
  return { props: {} };
};

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signInWithCustomToken } from "firebase/auth";
import axios from "axios";
import { getFirebaseAuth } from "../../firebase/client";

export default function AuthComplete() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base URL ของเว็บไซต์คุณ
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://phlyphant.com";

  // Backend Production URL จาก env ของคุณ
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.phlyphant.com";

  // หลัง login สำเร็จ ส่งกลับที่หน้า Dashboard
  const REDIRECT_AFTER_LOGIN = "/dashboard";

  useEffect(() => {
    if (!router.isReady) return;

    let token: string | undefined = undefined;

    // 1) customToken จาก query
    if (typeof router.query.customToken === "string") {
      token = router.query.customToken;
    }

    // 2) customToken จาก hash (#customToken=xxx)
    if (!token && typeof window !== "undefined") {
      const hashParams = new URLSearchParams(
        window.location.hash.replace("#", "")
      );
      token = hashParams.get("customToken") ?? undefined;
    }

    // 3) customToken จาก search (?customToken=xxx)
    if (!token && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get("customToken") ?? undefined;
    }

    // ถ้าไม่มี token → redirect
    if (!token) {
      setError("Missing custom token");
      router.replace("/auth-check");
      return;
    }

    const run = async () => {
      try {
        const auth = getFirebaseAuth();

        // 4) Firebase Sign-in
        const userCred = await signInWithCustomToken(auth, token);
        const idToken = await userCred.user.getIdToken(true);

        // 5) ส่ง idToken → backend เพื่อสร้าง session cookie
        await axios.post(
          `${API_BASE}/auth/session`,
          { idToken },
          { withCredentials: true }
        );

        // รอให้ Cookie ถูกเขียนลงเบราว์เซอร์
        await new Promise((res) => setTimeout(res, 200));

        // 6) Redirect → dashboard
        window.location.href = `${SITE_URL}${REDIRECT_AFTER_LOGIN}`;
      } catch (err: any) {
        console.error("Authentication failed:", err);
        setError(err?.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router.isReady]);

  if (loading) return <p>Signing you in...</p>;
  if (error) return <p>Error: {error}</p>;

  return <p>Done</p>;
}
