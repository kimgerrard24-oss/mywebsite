// frontend/src/components/security/VerifyCredentialForm.tsx

import { useState, FormEvent } from "react";
import { useVerifyCredential } from "@/hooks/useVerifyCredential";

type Props = {
  onSuccess: () => void;
};

export default function VerifyCredentialForm({
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("");
  const { submit, loading, error } = useVerifyCredential();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!password.trim()) return;

    const ok = await submit(password);
    if (ok) {
      onSuccess();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">
          Confirm your password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
