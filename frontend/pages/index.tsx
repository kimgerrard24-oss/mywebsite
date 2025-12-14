// ==============================
// frontend/pages/login.tsx
// FINAL — SessionService + OAuth Compatible
// ==============================

import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import LoginForm from "@/components/auth/LoginForm";
import { sessionCheckClient } from "@/lib/api/api";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://api.phlyphant.com"
).replace(/\/+$/, "");

function LoginPageInner() {
  const router = useRouter();

  const SITE_ORIGIN =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.phlyphant.com";

  /**
   * Guard:
   * - If session already valid → redirect away from login
   * - Do NOT decide auth here, rely on /auth/session-check only
   */
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const res = await sessionCheckClient();
        if (mounted && res?.valid === true) {
          router.replace("/feed");
        }
      } catch {
        // ignore — user not logged in
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  /**
   * OAuth entry point only
   * - No cookie check
   * - No Firebase handling
   * - No session decision here
   * Social callback MUST be handled by /auth/complete
   */
  const startOAuth = (provider: "google" | "facebook") => {
    window.location.href = `${API_BASE}/auth/${provider}?origin=${encodeURIComponent(
      SITE_ORIGIN
    )}`;
  };

  return (
    <>
      <Head>
        <title>PhlyPhant – Login</title>
        <meta
          name="description"
          content="เข้าสู่ระบบเพื่อเริ่มใช้งาน PhlyPhant แพลตฟอร์มโซเชียลของไทย"
        />
        <meta property="og:title" content="PhlyPhant – Login" />
        <meta property="og:url" content="https://www.phlyphant.com/login" />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="w-full py-6 border-b bg-white/80 backdrop-blur">
          <nav className="container mx-auto px-4 flex items-center justify-between">
            <a
              href="/"
              className="text-2xl font-bold text-blue-600"
              aria-label="PhlyPhant Home"
            >
              PhlyPhant
            </a>
            <a
              href="/"
              className="text-gray-800 hover:text-blue-600 transition text-sm"
            >
              Home
            </a>
          </nav>
        </header>

        <section
          className="flex flex-col-reverse md:flex-row flex-1 container mx-auto px-4 py-10 gap-10"
          aria-labelledby="login-heading"
        >
          <article className="flex-1 bg-white shadow-lg rounded-xl p-8 flex flex-col justify-center">
            <header className="mb-6">
              <h1
                id="login-heading"
                className="text-3xl font-bold mb-2 text-gray-900"
              >
                Login to PhlyPhant
              </h1>
              <p className="text-gray-600">
                เข้าสู่ระบบเพื่อเริ่มใช้งานแพลตฟอร์มโซเชียลใหม่ล่าสุดของไทย
              </p>
            </header>

            <LoginForm />

            <div className="mt-4 text-center">
              <a
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <div className="mt-4 text-center">
              <a
                href="/auth/register"
                className="block w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition mt-4 text-center"
              >
                Register
              </a>
            </div>

            <section className="mt-8 space-y-4" aria-label="Social login options">
              <button
                onClick={() => startOAuth("google")}
                className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <img
                  src="/icons/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Login with Google
              </button>

              <button
                onClick={() => startOAuth("facebook")}
                className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <img
                  src="/icons/facebook.svg"
                  alt="Facebook"
                  className="w-5 h-5 mr-2"
                />
                Login with Facebook
              </button>
            </section>
          </article>

          <aside className="flex-1 flex items-center justify-center">
            <img
              src="/images/social-hero.svg"
              alt="PhlyPhant Social Media Illustration"
              className="max-w-full h-auto"
            />
          </aside>
        </section>

        <footer className="py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} PhlyPhant — All rights reserved.
        </footer>
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(LoginPageInner), { ssr: false });
