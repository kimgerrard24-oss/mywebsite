// frontend/src/components/settings/PhoneConfirmForm.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import { confirmPhoneChange } from "@/lib/api/user";

export default function PhoneConfirmForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await confirmPhoneChange(token.trim());
      router.push("/settings/security");
    } catch (err: any) {
      setError(
        err?.body?.message ||
          "Invalid or expired verification code",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">
          Verification code
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          placeholder="Enter code from SMS"
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
        className="w-full rounded bg-black py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Confirming..." : "Confirm phone"}
      </button>
    </form>
  );
}
