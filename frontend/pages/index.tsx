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
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <nav
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-4
            py-4
            sm:px-6
            lg:px-8
          "
          aria-label="Primary navigation"
        >
          <a
            href="/"
            className="
              text-xl
              sm:text-2xl
              font-bold
              text-blue-600
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              rounded
            "
            aria-label="PhlyPhant Home"
          >
            PhlyPhant
          </a>

          <a
            href="/"
            className="
              text-sm
              font-medium
              text-gray-700
              hover:text-blue-600
              transition-colors
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              rounded
            "
          >
            Home
          </a>
        </nav>
      </header>

      {/* Content */}
      <section
        aria-labelledby="login-heading"
        className="
          mx-auto
          flex
          w-full
          max-w-7xl
          flex-1
          flex-col-reverse
          gap-8
          px-4
          py-8
          sm:px-6
          md:flex-row
          md:gap-10
          lg:px-8
          lg:py-12
        "
      >
        {/* Login Card */}
        <article
          className="
            flex
            w-full
            flex-1
            flex-col
            justify-center
            rounded-xl
            bg-white
            p-6
            sm:p-8
            shadow-md
            md:shadow-lg
          "
        >
          <header className="mb-5 sm:mb-6">
            <h1
              id="login-heading"
              className="
                mb-2
                text-2xl
                sm:text-3xl
                font-bold
                text-gray-900
              "
            >
              Login to PhlyPhant
            </h1>

            <p className="text-sm sm:text-base text-gray-600">
              เข้าสู่ระบบเพื่อเริ่มใช้งานแพลตฟอร์มโซเชียลใหม่ล่าสุดของไทย
            </p>
          </header>

          <LoginForm />

          <div className="mt-4 text-center">
            <a
              href="/auth/forgot-password"
              className="
                text-sm
                text-blue-600
                hover:underline
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                rounded
              "
            >
              Forgot password?
            </a>
          </div>

          <div className="mt-4">
            <a
              href="/auth/register"
              className="
                block
                w-full
                rounded-lg
                border
                border-blue-600
                px-4
                py-3
                text-center
                text-sm
                font-medium
                text-blue-600
                transition-colors
                hover:bg-blue-50
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
              "
            >
              Register
            </a>
          </div>

          {/* Social Login */}
          <section
            className="mt-8 space-y-3 sm:space-y-4"
            aria-label="Social login options"
          >
            <button
  onClick={() => startOAuth('google')}
  type="button"
  className="
    inline-flex
    w-full
    items-center
    justify-center
    rounded-lg
    border
    border-gray-300
    bg-white
    py-3
    transition-colors
    hover:bg-gray-50
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-gray-400
  "
  aria-label="Sign in with Google"
>
  <img
    src="/images/icons/google.svg"
    alt="Sign in with Google"
    className="h-10"
  />
</button>


            <button
              onClick={() => startOAuth('facebook')}
              type="button"
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-gray-300
                bg-white
                py-3
                text-sm
                font-medium
                text-gray-800
                transition-colors
                hover:bg-gray-50
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-gray-400
              "
            >
              <img
                src="/icons/facebook.svg"
                alt="Facebook"
                className="h-5 w-5"
              />
              Login with Facebook
            </button>
          </section>
        </article>

        {/* Illustration */}
        <aside
          className="
            flex
            w-full
            flex-1
            items-center
            justify-center
          "
          aria-hidden="true"
        >
          <img
            src="/images/social-hero.svg"
            alt="PhlyPhant Social Media Illustration"
            className="
              h-auto
              max-w-xs
              sm:max-w-sm
              md:max-w-md
              lg:max-w-lg
            "
          />
        </aside>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-500">
        © {new Date().getFullYear()} PhlyPhant — All rights reserved.
      </footer>
    </main>
  </>
);

}

export default dynamic(() => Promise.resolve(LoginPageInner), { ssr: false });
