// frontend/src/components/auth/RequestSetPasswordForm.tsx
"use client";

import { useState } from "react";
import { requestSetPassword } from "@/lib/api/auth";

export default function RequestSetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await requestSetPassword();
      setDone(true);
    } catch (err: any) {
      setError(
        "Unable to send password setup email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        If your account is eligible, we’ve sent a password setup link
        to your email. Please check your inbox.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send password setup email"}
      </button>
    </section>
  );
}
