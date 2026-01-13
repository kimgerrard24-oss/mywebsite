// frontend/src/components/security/AccountLockForm.tsx

import { useState } from "react";
import { verifyCredential } from "@/lib/api/user";
import { lockMyAccount } from "@/lib/api/api-security";
import { resetAfterAccountLock } from "@/lib/socket";

export default function AccountLockForm() {
  const [step, setStep] = useState<
    "verify" | "confirm" | "loading" | "done"
  >("verify");

  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    setStep("loading");

    try {
      await verifyCredential(password);
      setStep("confirm");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Invalid password",
      );
      setStep("verify");
    }
  }

  async function handleLock() {
    setError(null);
    setStep("loading");

    try {
      await lockMyAccount(token);

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
      setStep("confirm");
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
            onClick={handleVerify}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Verify & Continue
          </button>
        </>
      )}

      {step === "confirm" && (
        <>
          <label className="block text-sm font-medium">
            Verification code
          </label>
          <input
            type="text"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={token}
            onChange={(e) =>
              setToken(e.target.value)
            }
            placeholder="Enter verification token"
          />
          <button
            onClick={handleLock}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Lock My Account
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
