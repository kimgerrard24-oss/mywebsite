// frontend/src/components/security/AccountLockForm.tsx

import { useState } from "react";
import { verifyCredential } from "@/lib/api/user";
import { lockMyAccount } from "@/lib/api/api-security";
import { resetAfterAccountLock } from "@/lib/socket";

export default function AccountLockForm() {
  const [step, setStep] = useState<
    "verify" | "loading" | "done"
  >("verify");

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleVerifyAndLock() {
    setError(null);
    setStep("loading");

    try {
      // 1) verify credential (backend marks session verified)
      await verifyCredential(password);

      // 2) lock account (no token from client)
      await lockMyAccount();

      // reset socket + auth-related client state
      resetAfterAccountLock();

      setStep("done");

      // redirect to login
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to lock account",
      );
      setStep("verify");
    }
  }

  if (step === "done") {
    return (
      <p className="text-sm text-green-700">
        Your account has been locked. Redirecting…
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {step === "verify" && (
        <>
          <label className="block text-sm font-medium">
            Confirm your password
          </label>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
          />
          <button
            onClick={handleVerifyAndLock}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Verify & Lock Account
          </button>
        </>
      )}

      {step === "loading" && (
        <p className="text-sm text-gray-600">
          Processing…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}