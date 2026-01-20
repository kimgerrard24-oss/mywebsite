// frontend/src/components/account/PrivacySettingToggle.tsx

"use client";

import { useState } from "react";
import { updateMyPrivacy } from "@/lib/api/user-privacy";
import { fetchMyProfileClient } from "@/lib/api/user";

type Props = {
  initialIsPrivate: boolean;
};

export default function PrivacySettingToggle({ initialIsPrivate }: Props) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (loading) return;

    const next = !isPrivate;

    setLoading(true);
    setError(null);

    try {
      // backend authority
      await updateMyPrivacy(next);

      // resync from backend (never trust local state)
      const profile = await fetchMyProfileClient();
      if (profile && typeof profile.isPrivate === "boolean") {
        setIsPrivate(profile.isPrivate);
      } else {
        setIsPrivate(next);
      }
    } catch (err: any) {
      setError("Unable to update privacy setting. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-medium">Private account</h2>
          <p className="text-sm text-gray-600 mt-1">
            When private, only approved followers can see your posts and profile.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-pressed={isPrivate}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            isPrivate ? "bg-blue-600" : "bg-gray-300",
            loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white transition",
              isPrivate ? "translate-x-5" : "translate-x-1",
            ].join(" ")}
          />
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
