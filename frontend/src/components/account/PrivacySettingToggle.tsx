// frontend/src/components/account/PrivacySettingToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { updateMyPrivacy } from "@/lib/api/user-privacy";
import { fetchMyProfileClient } from "@/lib/api/user";

type Props = {
  initialIsPrivate: boolean;
};

export default function PrivacySettingToggle({ initialIsPrivate }: Props) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ALWAYS resync from backend on mount (backend authority)
  useEffect(() => {
    let alive = true;

    async function sync() {
      try {
        const profile = await fetchMyProfileClient();
        if (
          alive &&
          profile &&
          typeof profile.isPrivate === "boolean"
        ) {
          setIsPrivate(profile.isPrivate);
        }
      } catch {
        // fail-soft: keep initial state
      }
    }

    sync();

    return () => {
      alive = false;
    };
  }, []);

  async function handleToggle() {
    if (loading) return;

    const next = !isPrivate;

    setLoading(true);
    setError(null);

    // optimistic UX (but backend still authority)
    setIsPrivate(next);

    try {
      await updateMyPrivacy(next);

      // resync from backend to guarantee truth
      const profile = await fetchMyProfileClient();
      if (profile && typeof profile.isPrivate === "boolean") {
        setIsPrivate(profile.isPrivate);
      }
    } catch {
      // rollback on failure
      setIsPrivate(!next);
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
          aria-busy={loading}
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


