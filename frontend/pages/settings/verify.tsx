// frontend/pages/settings/verify.tsx

import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";

import VerifyCredentialForm from "@/components/security/VerifyCredentialForm";

/**
 * 🔐 Allowed post-verification destinations (FE only)
 * Backend actions are orchestrated by those pages.
 */
const ALLOWED_NEXT = [
  "/settings/security?do=export",
  "/settings/security?do=lock",
  "/settings/email",
];

export default function VerifyCredentialPage() {
  const router = useRouter();

  // =================================================
  // ✅ Safe next target (anti open-redirect)
  // =================================================
  const next = useMemo(() => {
    if (typeof router.query.next !== "string") {
      return "/settings/security";
    }

    if (ALLOWED_NEXT.includes(router.query.next)) {
      return router.query.next;
    }

    return "/settings/security";
  }, [router.query.next]);

  return (
    <>
      <Head>
        <title>Verify Identity | PhlyPhant</title>
        <meta
          name="description"
          content="Confirm your password before continuing sensitive actions"
        />
      </Head>

      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-xl font-semibold">
          Security verification
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Please confirm your password to continue.
        </p>

        <div className="mt-6">
          <VerifyCredentialForm
            onSuccess={() => {
              // 🔐 redirect only to approved FE routes
              router.replace(next);
            }}
          />
        </div>
      </main>
    </>
  );
}
