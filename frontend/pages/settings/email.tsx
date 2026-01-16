// frontend/pages/settings/email.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";

import EmailChangeForm from "@/components/settings/EmailChangeForm";

/** ✅ NEW: resend verification */
import ResendVerificationButton from "@/components/security/ResendVerificationButton";

export default function EmailSettingsPage() {
  return (
    <>
      <Head>
        <title>Email settings | PhlyPhant</title>
        <meta
          name="description"
          content="Change or verify your email address"
        />
      </Head>

      <main className="mx-auto max-w-xl px-4 py-8">
        {/* ================================
            Back Link
           ================================ */}
        <div className="mb-6">
          <Link
            href="/settings/profile"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to profile
          </Link>
        </div>

        {/* ================================
            Change Email Section (EXISTING)
           ================================ */}
        <section>
          <h1 className="text-2xl font-semibold">
            Change email
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            You must confirm your new email before
            it becomes active.
          </p>

          <div className="mt-6">
            <EmailChangeForm />
          </div>
        </section>

        {/* ================================
            ✅ NEW: Resend Verification Section
           ================================ */}
        <section className="mt-12 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">
            Email verification
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            If you didn’t receive the verification email,
            you can request a new one.
          </p>

          <div className="mt-4">
            <ResendVerificationButton />
          </div>
        </section>
      </main>
    </>
  );
}

/* ================================
   SSR AUTH CHECK (STANDARD)
   ================================ */
export const getServerSideProps: GetServerSideProps =
  async (ctx) => {
    const cookieHeader =
      ctx.req.headers.cookie;

    if (!cookieHeader) {
      return {
        redirect: {
          destination: "/feed",
          permanent: false,
        },
      };
    }

    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

    const res = await fetch(
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

    if (!res.ok) {
      return {
        redirect: {
          destination: "/feed",
          permanent: false,
        },
      };
    }

    const data = await res.json().catch(() => null);

    if (!data || data.valid !== true) {
      return {
        redirect: {
          destination: "/feed",
          permanent: false,
        },
      };
    }

    return { props: {} };
  };
