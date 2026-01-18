// frontend/src/hooks/useVerifyCredential.ts

import { useState, useCallback } from "react";
import { verifyCredential } from "@/lib/api/user";

export type VerifyCredentialScope =
  | "ACCOUNT_LOCK"
  | "PROFILE_EXPORT";

type SubmitPayload =
  | string
  | {
      password: string;
      scope: VerifyCredentialScope;
    };

export function useVerifyCredential() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: SubmitPayload) => {
      setLoading(true);
      setError(null);

      try {
        // =========================================
        // ✅ Backward compatible input handling
        // =========================================
        const payload =
          typeof input === "string"
            ? { password: input }
            : input;

        await verifyCredential(payload as any);
        return true;
      } catch (err: any) {
        /**
         * NestJS validation / HttpException shape:
         * {
         *   message: string | string[]
         * }
         */
        const msg =
          Array.isArray(err?.body?.message)
            ? err.body.message[0]
            : err?.body?.message ||
              err?.message ||
              "Verification failed";

        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    submit,
    loading,
    error,
  };
}

