// frontend/pages/settings/email-confirm.tsx

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { confirmEmailChange } from "@/lib/api/user";

type Status = "idle" | "loading" | "success" | "error";

export default function EmailConfirmPage() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    if (typeof token !== "string") {
      setStatus("error");
      setError("Invalid verification link");
      return;
    }

    const verifiedToken: string = token;

    let cancelled = false;

    async function run() {
      try {
        setStatus("loading");

    await confirmEmailChange(verifiedToken);

        if (cancelled) return;

        setStatus("success");
      } catch (err: any) {
        if (cancelled) return;

        setStatus("error");
        setError(
          err?.response?.data?.message ??
            "Verification link is invalid or expired",
        );
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, token]);

  return (
    <>
      <Head>
        <title>Email verification | PhlyPhant</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="mx-auto max-w-md px-4 py-16 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-semibold">
              Verifying your email…
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please wait a moment
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-green-600">
              Email verified successfully 🎉
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              You can now log in to your account.
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Go to login
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-red-600">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>

            <div className="mt-6">
              <Link
                href="/settings/email"
                className="text-sm text-blue-600 hover:underline"
              >
                Resend verification email
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
