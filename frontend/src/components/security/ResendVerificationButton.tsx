// frontend/src/components/security/ResendVerificationButton.tsx

import { useEffect } from "react";
import { useResendVerification } from "@/hooks/useResendVerification";

export default function ResendVerificationButton() {
  const { state, resend, reset } =
    useResendVerification();

  useEffect(() => {
    if (state.status === "success") {
      const t = setTimeout(() => {
        reset();
      }, 5000);

      return () => clearTimeout(t);
    }
  }, [state.status, reset]);

  return (
    <div className="space-y-2">
      <button
        onClick={resend}
        disabled={state.status === "sending"}
        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {state.status === "sending"
          ? "Sending..."
          : "Resend verification email"}
      </button>

      {state.status === "success" && (
        <p className="text-sm text-green-600">
          Verification email has been sent. Please check
          your inbox.
        </p>
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </div>
  );
}
