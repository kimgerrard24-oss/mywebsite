// frontend/src/components/profile/EmailChangeForm.tsx

import { useState } from "react";
import { requestEmailChange } from "@/lib/api/user";

export default function EmailChangeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      await requestEmailChange(email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to request email change",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block text-sm font-medium">
        New email
      </label>

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="
          w-full rounded-md border px-3 py-2 text-sm
          focus:ring-2 focus:ring-blue-500
        "
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {success && (
        <p className="text-xs text-green-600">
          Confirmation email sent
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          mt-1 rounded-md bg-black px-4 py-2 text-sm text-white
          disabled:opacity-50
        "
      >
        {loading ? "Sending..." : "Change email"}
      </button>
    </form>
  );
}
