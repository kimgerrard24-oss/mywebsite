// pages/index.tsx
import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backend =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  // ================================================
  // FIX 1: ห้ามให้ผู้ใช้ที่ login แล้วกลับมาหน้า login
  // ================================================
  useEffect(() => {
    const session = Cookies.get("__session");
    if (session) {
      window.location.href = "/home";
    }
  }, []);

  const handleLocalLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Backend ยังไม่มี route นี้ แต่คงไว้ตามเดิม
      await fetch(`${backend}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // FIX 2: หลัง login สำเร็จ redirect ไปหน้า Home จริง
      window.location.href = "/home";
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const startOAuth = (provider: "google" | "facebook") => {
    const url = `${backend}/auth/${provider}`;
    window.location.href = url;
  };

  const loginWithGoogle = () => startOAuth("google");
  const loginWithFacebook = () => startOAuth("facebook");

  return (
    <>
      <Head>
        <title>PhlyPhant – Connect, Share, Create</title>
        <meta
          name="description"
          content="PhlyPhant — แพลตฟอร์มโซเชียลมีเดียสำหรับการแชร์ เชื่อมต่อ และสร้างสรรค์อย่างไร้ขีดจำกัด."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="PhlyPhant Social Platform" />
        <meta
          property="og:description"
          content="โซเชียลแพลตฟอร์มใหม่ของไทย เพื่อการเชื่อมต่ออย่างมีคุณภาพ"
        />
        <meta property="og:url" content="https://phlyphant.com" />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen flex flex-col">
        <header className="w-full py-6 border-b bg-white/80 backdrop-blur">
          <nav className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">PhlyPhant</h1>
            <a
              href="/"
              className="text-gray-800 hover:text-blue-600 transition text-sm"
            >
              Home
            </a>
          </nav>
        </header>

        <section className="flex flex-col-reverse md:flex-row flex-1 container mx-auto px-4 py-10 gap-10">
          <article className="flex-1 bg-white shadow-lg rounded-xl p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Welcome to PhlyPhant
            </h2>
            <p className="text-gray-600 mb-8">
              เข้าสู่ระบบเพื่อเริ่มใช้งานแพลตฟอร์มโซเชียลใหม่ล่าสุดของไทย
            </p>

            <form className="space-y-5" onSubmit={handleLocalLogin}>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Login
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <button
                onClick={loginWithGoogle}
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
                onClick={loginWithFacebook}
                className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <img
                  src="/icons/facebook.svg"
                  alt="Facebook"
                  className="w-5 h-5 mr-2"
                />
                Login with Facebook
              </button>
            </div>
          </article>

          <aside className="flex-1 flex items-center justify-center">
            <img
              src="/images/social-hero.svg"
              alt="PhlyPhant Social Media"
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
