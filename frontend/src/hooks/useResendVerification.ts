// frontend/src/hooks/useResendVerification.ts

import { useState, useCallback } from "react";
import { resendEmailVerification } from "@/lib/api/auth";
import type { ResendVerificationState } from "@/types/email-verification";

export function useResendVerification() {
  const [state, setState] =
    useState<ResendVerificationState>({
      status: "idle",
    });

  const resend = useCallback(async () => {
    if (state.status === "sending") return;

    setState({ status: "sending" });

    try {
      await resendEmailVerification();
      setState({ status: "success" });
    } catch (err: any) {
      let message =
        "Unable to send verification email. Please try again later.";

      if (
        err?.response?.data?.message &&
        typeof err.response.data.message === "string"
      ) {
        message = err.response.data.message;
      }

      setState({
        status: "error",
        message,
      });
    }
  }, [state.status]);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    state,
    resend,
    reset,
  };
}
