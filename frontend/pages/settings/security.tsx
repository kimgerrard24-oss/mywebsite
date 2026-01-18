// frontend/pages/settings/security.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import type { SecurityEventPage } from "@/types/security-event";
import SecurityEventList from "@/components/security/SecurityEventList";
import { useSecurityEvents } from "@/hooks/useSecurityEvents";
import AccountLockForm from "@/components/security/AccountLockForm";
import ProfileExportButton from "@/components/security/ProfileExportButton";
import { lockMyAccount } from "@/lib/api/api-security";

type Props = {
  initial: SecurityEventPage | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.phlyphant.com";

export default function SecuritySettingsPage({
  initial,
}: Props) {
  const { items, hasMore, loading, loadMore } =
    useSecurityEvents(initial ?? undefined);

  const router = useRouter();
  const didRunRef = useRef(false);

  const action =
  router.query.do === "lock" || router.query.do === "export"
    ? router.query.do
    : undefined;


  // =================================================
  // 🔐 Sensitive action orchestrator (post-verify)
  // =================================================
  useEffect(() => {
    if (didRunRef.current) return;

    if (action === "lock") {
      didRunRef.current = true;

      lockMyAccount()
        .then(() => {
          // account is now locked → must leave app
          window.location.href = "/login";
        })
        .catch(() => {
          router.replace("/settings/security");
        });
    }

   if (action === "export") {
  didRunRef.current = true;

  (async () => {
    try {
      const res = await fetch(
        `${API_BASE}/users/me/profile/export`,
        {
          method: "GET",
          credentials: "include", // ✅ ส่ง cookie auth
        },
      );

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();

      // ✅ ดึงชื่อไฟล์จาก header ถ้ามี
      const cd = res.headers.get("content-disposition");
      const filename =
        cd?.match(/filename="(.+)"/)?.[1] ??
        "phlyphant-profile.json";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // ✅ clean URL หลัง download
      router.replace("/settings/security");
    } catch (err) {
      router.replace("/settings/security");
    }
  })();
}

  }, [action, router]);

  return (
    <>
      <Head>
        <title>Security activity | PhlyPhant</title>
        <meta
          name="description"
          content="View recent security activity on your account"
        />
      </Head>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/settings/profile"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to settings
          </Link>
        </div>

        <section>
          <h1 className="text-2xl font-semibold">
            Security activity
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Recent login and sensitive actions on your account
          </p>
        </section>

        {/* ================================
            🔔 Status banner (export flow)
           ================================ */}
        {action === "export" && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Preparing your download… Your file should start
            downloading automatically.
          </div>
        )}

        {/* ================================
            Security Events
           ================================ */}
        <section className="mt-6">
          <SecurityEventList events={items} />

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </section>

        {/* ================================
            Profile Export
           ================================ */}
        {action !== "lock" && (
          <section className="mt-12 rounded-xl border p-5">
            <h2 className="text-lg font-semibold">
              Download your data
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Get a copy of your profile, posts, and activity
              stored on PhlyPhant.
            </p>

            <div className="mt-4">
              <ProfileExportButton />
            </div>
          </section>
        )}

        {/* ================================
            Account Lock
           ================================ */}
        {action !== "export" && (
          <section className="mt-12 rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-lg font-semibold text-red-700">
              Lock your account
            </h2>
            <p className="mt-1 text-sm text-red-700/80">
              This will immediately sign you out from all devices
              and prevent any further access until recovery.
            </p>

            <div className="mt-4">
              <AccountLockForm />
            </div>
          </section>
        )}
      </main>
    </>
  );
}

/* ============================
   SSR — AUTH ONLY
   ============================ */
export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  if (!cookieHeader) {
    return {
      redirect: { destination: "/feed", permanent: false },
    };
  }

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  // 1) session check
  const sessionRes = await fetch(
    `${base}/auth/session-check`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!sessionRes.ok) {
    return {
      redirect: { destination: "/feed", permanent: false },
    };
  }

  const session = await sessionRes.json().catch(() => null);

  if (!session || session.valid !== true) {
    return {
      redirect: { destination: "/feed", permanent: false },
    };
  }

  // 2) fetch security events
  let initial: SecurityEventPage | null = null;

  try {
    const res = await fetch(
      `${base}/users/me/security-events?limit=20`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (res.ok) {
      initial = await res.json().catch(() => null);
    }
  } catch {
    initial = null;
  }

  return { props: { initial } };
};
