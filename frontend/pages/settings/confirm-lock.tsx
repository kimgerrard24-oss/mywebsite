// frontend/pages/settings/confirm-lock.tsx

import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { lockMyAccount } from "@/lib/api/api-security";

export default function ConfirmLockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await lockMyAccount();

      /**
       * After account lock:
       * - backend revokes sessions
       * - redirect to public entry (login / home)
       */
      window.location.href = "/";
    } catch {
      // fail-safe: go back to security page
      setLoading(false);
      setError(
        "Unable to lock your account at the moment. Please try again.",
      );
    }
  }

  return (
    <>
      <Head>
        <title>Confirm account lock | PhlyPhant</title>
        <meta
          name="description"
          content="Confirm locking your account and signing out from all devices"
        />
      </Head>

      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-xl font-semibold text-red-700">
          Confirm account lock
        </h1>

        <p className="mt-3 text-sm text-gray-700">
          This will immediately lock your account and sign you out
          from all devices. You will not be able to log in again
          until account recovery.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Locking account..." : "Lock my account"}
          </button>

          <button
            onClick={() =>
              router.replace("/settings/security")
            }
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </main>
    </>
  );
}
