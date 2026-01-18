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
  "/settings/confirm-lock",
  "/settings/email",
] as const;


type VerifyScope = "ACCOUNT_LOCK" | "PROFILE_EXPORT";

/**
 * Map FE intent → backend verification scope
 * Backend remains authority; FE only declares intent.
 */
const SCOPE_BY_NEXT: Record<string, VerifyScope> = {
  "/settings/security?do=export": "PROFILE_EXPORT",
  "/settings/security?do=lock": "ACCOUNT_LOCK",
  "/settings/confirm-lock": "ACCOUNT_LOCK",
};

export default function VerifyCredentialPage() {
  const router = useRouter();

  // =================================================
  // ✅ Safe next target (anti open-redirect)
  // =================================================
  const next = useMemo(() => {
    if (typeof router.query.next !== "string") {
      return "/settings/security";
    }

    if (ALLOWED_NEXT.includes(router.query.next as any)) {
      return router.query.next;
    }

    return "/settings/security";
  }, [router.query.next]);

  // =================================================
  // 🔐 Verification scope (FE intent only)
  // =================================================
  const scope = useMemo<VerifyScope | null>(() => {
    return SCOPE_BY_NEXT[next] ?? null;
  }, [next]);

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
            scope={scope}
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

