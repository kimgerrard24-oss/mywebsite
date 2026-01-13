// frontend/pages/settings/email-confirm.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { confirmEmailChange } from "@/lib/api/user";

type Props = {
  token: string | null;
};

export default function EmailConfirmPage({ token }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!token) return;

  const confirmedToken = token; // 👈 now typed as string

  let cancelled = false;

  async function run() {
    try {
      setStatus("loading");
      await confirmEmailChange(confirmedToken);
      if (cancelled) return;
      setStatus("success");

      setTimeout(() => {
        router.replace("/settings/profile");
      }, 1500);
    } catch (err: any) {
      if (cancelled) return;
      setStatus("error");
      setError(
        err?.response?.data?.message ??
          "Failed to confirm email",
      );
    }
  }

  run();

  return () => {
    cancelled = true;
  };
}, [token, router]);


  return (
    <>
      <Head>
        <title>Confirm Email | PhlyPhant</title>
      </Head>

      <main className="mx-auto max-w-md px-4 py-16 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-semibold">
              Confirming your email…
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please wait a moment
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-green-600">
              Email updated successfully
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to profile…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-red-600">
              Email confirmation failed
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>

            <div className="mt-6">
              <Link
                href="/settings/profile"
                className="text-sm text-blue-600 hover:underline"
              >
                Back to profile
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
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

  // 1) session check
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
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  const session = await sessionRes.json().catch(() => null);

  if (!session || session.valid !== true) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  // 2) token from query
  const token =
    typeof ctx.query.token === "string"
      ? ctx.query.token
      : null;

  if (!token) {
    return {
      redirect: {
        destination: "/settings/profile",
        permanent: false,
      },
    };
  }

  return {
    props: {
      token,
    },
  };
};
