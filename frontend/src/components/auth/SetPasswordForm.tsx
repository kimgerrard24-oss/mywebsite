// frontend/src/components/auth/SetPasswordForm.tsx

"use client";

import { useState } from "react";
import { confirmSetPassword } from "@/lib/api/auth";
import { validatePassword } from "@/utils/passwordPolicy";

type Props = {
  token: string;
};

export default function SetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const err = validatePassword(password);
    if (err) return setError(err);

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      await confirmSetPassword({
        token,
        newPassword: password,
      });

      setDone(true);
    } catch (e: any) {
      setError(e.message || "Unable to set password.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <section className="text-center py-10">
        <h2 className="text-xl font-semibold mb-3">
          Password Set Successfully
        </h2>
        <p className="text-gray-600">
          You can now log in using your email and password.
        </p>
        <a
          href="/"
          className="inline-block mt-6 text-blue-600 underline"
        >
          Go to Login
        </a>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow"
    >
      <h1 className="text-xl font-semibold mb-4">
        Set Your Password
      </h1>

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      <label className="block mb-3">
        <span className="block mb-1 text-sm">
          New Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </label>

      <label className="block mb-5">
        <span className="block mb-1 text-sm">
          Confirm Password
        </span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
      >
        {loading ? "Saving..." : "Set Password"}
      </button>
    </form>
  );
}
