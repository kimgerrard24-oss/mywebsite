// frontend/pages/settings/phone.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import PhoneChangeForm from "@/components/settings/PhoneChangeForm";
import type { UserProfile } from "@/types/user-profile";

type Props = {
  user: UserProfile | null;
};

export default function PhoneSettingsPage({ user }: Props) {
  if (!user) return null;

  return (
    <>
      {/* ================= SEO ================= */}
      <Head>
        <title>Change phone number | PhlyPhant</title>
        <meta
          name="description"
          content="Change and verify your phone number on PhlyPhant"
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* ================= Page Layout ================= */}
      <main
        className="
          mx-auto
          max-w-2xl
          px-4
          py-8
        "
      >
        {/* ===== Back Navigation ===== */}
        <nav aria-label="Settings navigation" className="mb-6">
          <Link
            href="/settings/profile"
            prefetch={false}
            className="
              inline-flex
              items-center
              gap-1
              text-sm
              text-blue-600
              hover:underline
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              rounded
            "
          >
            ← Back to settings
          </Link>
        </nav>

        {/* ===== Page Header ===== */}
        <header>
          <h1 className="text-2xl font-semibold">
            Change phone number
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            We will send a verification code to your new phone number.
          </p>
        </header>

        {/* ===== Main Content ===== */}
        <section
          className="mt-8"
          aria-labelledby="change-phone-form"
        >
          <h2 id="change-phone-form" className="sr-only">
            Phone number verification form
          </h2>

          <PhoneChangeForm />
        </section>
      </main>
    </>
  );
}

/* =====================================================
   SSR AUTH CHECK (COPY PATTERN — DO NOT TOUCH)
   ===================================================== */
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
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

  // 1) Session check (AUTHORITY = BACKEND)
  const sessionRes = await fetch(`${base}/auth/session-check`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    credentials: "include",
    cache: "no-store",
  });

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

  // 2) Load user profile (FAIL-SOFT)
  let user: UserProfile | null = null;

  try {
    const userRes = await fetch(`${base}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (userRes.ok) {
      const json = await userRes.json().catch(() => null);
      user = json?.data ?? json ?? null;
    }
  } catch {
    user = null;
  }

  return { props: { user } };
};
