// frontend/pages/dashboard.tsx
import React from "react";
import { GetServerSideProps } from "next";
import LogoutButton from "@/components/auth/LogoutButton";
import { validateSessionOnServer } from "@/lib/auth";

type DashboardProps = {
  valid: boolean;
  user: any | null;
};

export default function Dashboard({ valid, user }: DashboardProps) {
  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Unauthorized</h1>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อเข้าหน้านี้</p>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ไปยังหน้า Login
          </a>
        </div>
      </div>
    );
  }

  // ===========================
  // Provider label formatting
  // ===========================
  const provider = user?.firebase?.sign_in_provider || "unknown";

  const providerLabel =
    provider === "google.com"
      ? "Google"
      : provider === "facebook.com"
      ? "Facebook"
      : provider === "password"
      ? "Email/Password"
      : provider === "custom"
      ? "Custom Token"
      : provider;

  // ===========================
  // Avatar fallback
  // ===========================
  const avatar =
    user?.picture ||
    user?.picture_url ||
    user?.avatar ||
    "/images/default-avatar.png";

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-200 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 border">

        <header className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <LogoutButton />
        </header>

        {/* =============================
            USER PROFILE SECTION
        ============================== */}
        <section className="flex items-center gap-6 mb-10">
          <img
            src={avatar}
            alt="avatar"
            className="w-24 h-24 rounded-full border shadow-md object-cover"
          />

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user?.name || user?.email?.split("@")[0] || "ผู้ใช้"}
            </h2>

            {user?.email && (
              <p className="text-gray-700 mt-1">Email: {user.email}</p>
            )}

            <p className="text-sm text-gray-500 mt-1">
              Provider: {providerLabel}
            </p>

            {user?.user_id && (
              <p className="text-sm text-gray-500">UID: {user.user_id}</p>
            )}
          </div>
        </section>

        {/* =============================
            QUICK MENU
        ============================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <a
            href="/account"
            className="p-6 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
          >
            <h3 className="text-lg font-semibold text-blue-700">บัญชีของฉัน</h3>
            <p className="text-sm text-gray-600 mt-2">ดูข้อมูลส่วนตัว</p>
          </a>

          <a
            href="/settings"
            className="p-6 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition"
          >
            <h3 className="text-lg font-semibold text-green-700">การตั้งค่า</h3>
            <p className="text-sm text-gray-600 mt-2">ตั้งค่าบัญชีและความเป็นส่วนตัว</p>
          </a>

          <a
            href="/messages"
            className="p-6 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition"
          >
            <h3 className="text-lg font-semibold text-purple-700">ข้อความ</h3>
            <p className="text-sm text-gray-600 mt-2">พูดคุยกับเพื่อนๆ</p>
          </a>
        </section>

        {/* =============================
            DEBUG INFORMATION
        ============================== */}
        <details className="bg-gray-100 p-4 rounded-xl border text-gray-800">
          <summary className="cursor-pointer font-medium mb-2">
            Debug: User Data
          </summary>
          <pre className="overflow-x-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    </main>
  );
}

/* ================================
   Server-side Session Protection
================================ */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  try {
    const result = await validateSessionOnServer(cookieHeader);

    if (!result || !result.valid) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const data = result as Record<string, any>;
    const user = data.user ?? null;

    return {
      props: {
        valid: true,
        user,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
