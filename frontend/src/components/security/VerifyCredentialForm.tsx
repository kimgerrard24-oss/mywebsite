// frontend/src/components/security/VerifyCredentialForm.tsx

import { useState, FormEvent } from "react";
import { useVerifyCredential } from "@/hooks/useVerifyCredential";

type VerifyScope = "ACCOUNT_LOCK" | "PROFILE_EXPORT";

type Props = {
  scope: VerifyScope | null;
  onSuccess: () => void;
};

export default function VerifyCredentialForm({
  scope,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("");
  const { submit, loading, error } = useVerifyCredential();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (loading) return;
    if (!password.trim()) return;
    if (!scope) return; // safety: must have intent

    const ok = await submit({
      password,
      scope,
    });

    // 🔐 clear sensitive input immediately
    setPassword("");

    if (ok) {
      onSuccess();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-busy={loading}
    >
      <div>
        <label
          htmlFor="verify-password"
          className="block text-sm font-medium"
        >
          Confirm your password
        </label>

        <input
          id="verify-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          autoComplete="current-password"
          disabled={loading}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {error && (
        <p
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !password.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
                   hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}

