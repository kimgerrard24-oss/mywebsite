// frontend/pages/settings/phone-confirm.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import PhoneConfirmForm from "@/components/settings/PhoneConfirmForm";

type Props = {};

export default function ConfirmPhonePage({}: Props) {
  return (
    <>
      <Head>
        <title>Confirm Phone Number | PhlyPhant</title>
        <meta
          name="description"
          content="Confirm your phone number change"
        />
      </Head>

      <main className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <Link
            href="/settings/security"
            prefetch={false}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to security
          </Link>
        </div>

        <h1 className="text-2xl font-semibold">
          Confirm phone number
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the verification code sent to your phone
        </p>

        <section className="mt-6">
          <PhoneConfirmForm />
        </section>
      </main>
    </>
  );
}

/* =====================================================
   SSR AUTH GUARD (SAME PATTERN AS PROFILE)
   ===================================================== */
export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const cookieHeader = ctx.req.headers.cookie;

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
        redirect: {
          destination: "/feed",
          permanent: false,
        },
      };
    }

    const session = await sessionRes
      .json()
      .catch(() => null);

    if (!session || session.valid !== true) {
      return {
        redirect: {
          destination: "/feed",
          permanent: false,
        },
      };
    }

    return { props: {} };
  };
