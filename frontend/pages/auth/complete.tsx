// pages/auth/complete.tsx
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import firebaseApp from "@/lib/firebaseClient";

interface CompleteProps {
  customToken?: string | null;
}

export default function AuthComplete({ customToken }: CompleteProps) {
  const router = useRouter();

  useEffect(() => {
    const login = async () => {
      const token = (window as any).__CUSTOM_TOKEN || customToken;
      if (!token) {
        router.replace("/login?error=missing_token");
        return;
      }

      try {
        const auth = getAuth(firebaseApp);
        await signInWithCustomToken(auth, token);
        router.replace("/");
      } catch (error) {
        console.error("Sign-in error:", error);
        router.replace("/login?error=signin_failed");
      }
    };

    login();
  }, [customToken, router]);

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

export async function getServerSideProps({ req }: any) {
  if (req.method === "POST") {
    const raw = await new Promise<string>((resolve) => {
      let data = "";
      req.on("data", (chunk: Buffer) => (data += chunk.toString()));
      req.on("end", () => resolve(data));
    });

    let customToken: string | null = null;

    const contentType = req.headers["content-type"] || "";

    // Case 1: application/x-www-form-urlencoded
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = new URLSearchParams(raw);
      customToken = body.get("customToken") || null;
    }

    // Case 2: application/json
    else if (contentType.includes("application/json")) {
      try {
        const json = JSON.parse(raw);
        customToken = json.customToken || null;
      } catch {
        customToken = null;
      }
    }

    // Case 3: fallback (unknown content-type)
    else {
      try {
        const body = new URLSearchParams(raw);
        customToken = body.get("customToken") || null;

        if (!customToken) {
          const json = JSON.parse(raw);
          customToken = json.customToken || null;
        }
      } catch {
        customToken = null;
      }
    }

    return {
      props: {
        customToken,
      },
    };
  }

  return {
    props: {},
  };
}
