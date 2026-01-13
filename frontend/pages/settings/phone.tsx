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
      <Head>
        <title>Change Phone | PhlyPhant</title>
        <meta
          name="description"
          content="Change your phone number on PhlyPhant"
        />
      </Head>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/settings/profile"
            prefetch={false}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to settings
          </Link>
        </div>

        <section>
          <h1 className="text-2xl font-semibold">
            Change phone number
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            We will send a verification code to your new
            phone number.
          </p>
        </section>

        <section className="mt-8">
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
