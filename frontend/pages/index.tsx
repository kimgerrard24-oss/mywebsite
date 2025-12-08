// frontend/pages/login.tsx

import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import axios from "axios";
import Cookies from "js-cookie";
import LoginForm from "@/components/auth/LoginForm";

import {
  getAuth,
  signInWithCustomToken,
  type User,
} from "firebase/auth";
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://api.phlyphant.com"
).replace(/\/+$/, "");

function createFirebaseApp(): FirebaseApp | null {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  if (!firebaseConfig.apiKey) {
    console.error("Missing Firebase config env values");
    return null;
  }

  try {
    if (getApps().length > 0) return getApp();
    return initializeApp(firebaseConfig);
  } catch {
    return null;
  }
}

function LoginPageInner() {
  const router = useRouter();

  useEffect(() => {
    const access = Cookies.get("phl_access");
    const refresh = Cookies.get("phl_refresh");
    const firebase = Cookies.get("__session");

    if (!access && !refresh && !firebase) return;

    let mounted = true;

    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/session-check`, {
          withCredentials: true,
        });

        if (!mounted) return;

        if (res.data?.valid === true) {
          router.replace("/feed");
        }
      } catch (err) {
        console.warn("session-check failed:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const customToken = url.searchParams.get("customToken");
        if (!customToken) return;

        const app = createFirebaseApp();
        if (!app) return;

        const auth = getAuth(app);

        await signInWithCustomToken(auth, customToken);

        const handleUser = async (u: User | null) => {
          if (!u) return;

          const idToken = await u.getIdToken(true);

          await fetch(`${API_BASE}/auth/complete`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          router.replace("/feed");
        };

        const currentUser = auth.currentUser;

        if (!currentUser) {
          auth.onAuthStateChanged(handleUser);
          return;
        }

        await handleUser(currentUser);
      } catch (err) {
        console.error("Custom Token Login Error:", err);
      }
    };

    run();
  }, [router]);

  const SITE_ORIGIN =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.phlyphant.com";

  const startOAuth = (provider: "google" | "facebook") => {
    window.location.href = `${API_BASE}/auth/${provider}?origin=${encodeURIComponent(
      SITE_ORIGIN
    )}`;
  };

  // ==================================================
  // JSX SEMANTIC + SEO
  // ==================================================
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
        {/* HEADER */}
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

        {/* CONTENT */}
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

            {/* 🎯 USE YOUR LoginForm DIRECTLY */}
            <LoginForm
              // You can pass callbacks or props here if needed later
            />

            {/* SOCIAL LOGIN */}
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

          {/* HERO ILLUSTRATION */}
          <aside className="flex-1 flex items-center justify-center">
            <img
              src="/images/social-hero.svg"
              alt="PhlyPhant Social Media Illustration"
              className="max-w-full h-auto"
            />
          </aside>
        </section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} PhlyPhant — All rights reserved.
        </footer>
      </main>
    </>
  );
}

// Dynamic no-SSR wrapper is unnecessary here → but preserved for compatibility
export default dynamic(() => Promise.resolve(LoginPageInner), { ssr: false });
