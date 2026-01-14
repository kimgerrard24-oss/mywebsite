// frontend/src/components/settings/EmailChangeForm.tsx

import { useEffect, useState } from "react";
import { requestEmailChange } from "@/lib/api/user";
import { getProfile } from "@/lib/api/auth";
import EmailChangeSuccess from "./EmailChangeSuccess";

export default function EmailChangeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // ==========================================
  // Load current email from backend (authority)
  // ==========================================
  useEffect(() => {
    let mounted = true;

    getProfile()
      .then((user) => {
        if (!mounted) return;
        if (user?.email) {
          setEmail(user.email);
        }
      })
      .catch(() => {
        // silent fail → user can still type manually
      })
      .finally(() => {
        if (mounted) setLoadingProfile(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // Submit change request
  // ==========================================
  async function onSubmit() {
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      await requestEmailChange(email.trim());
      setDone(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.body?.message ??
          "Failed to request email change",
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <EmailChangeSuccess email={email} />;
  }

  return (
    <div
      className="space-y-4"
      aria-label="Change email form"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          New email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loadingProfile || loading}
          className="
            mt-1
            w-full
            rounded-md
            border
            border-gray-300
            px-3
            py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            disabled:bg-gray-100
          "
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || loadingProfile}
        className="
          inline-flex
          items-center
          justify-center
          rounded-md
          bg-black
          px-4
          py-2
          text-sm
          font-medium
          text-white
          hover:bg-gray-800
          disabled:opacity-50
        "
      >
        {loading
          ? "Sending..."
          : loadingProfile
          ? "Loading..."
          : "Send verification email"}
      </button>
    </div>
  );
}
