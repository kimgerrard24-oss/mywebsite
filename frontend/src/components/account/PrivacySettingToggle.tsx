// frontend/src/components/account/PrivacySettingToggle.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { updateMyPrivacy } from "@/lib/api/user-privacy";
import { fetchMyProfileClient } from "@/lib/api/user";

type Props = {
  initialIsPrivate: boolean; // fallback only (UX), backend still authority
};

export default function PrivacySettingToggle({
  initialIsPrivate,
}: Props) {
  // start with SSR value
  const [isPrivate, setIsPrivate] =
    useState<boolean>(initialIsPrivate);

  const [synced, setSynced] = useState(false); // backend sync status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prevent initial sync from overwriting user action
  const hasUserInteractedRef = useRef(false);

  // backend authority sync on mount
  useEffect(() => {
    let alive = true;

    async function sync() {
      try {
        const profile = await fetchMyProfileClient();

        if (
          alive &&
          !hasUserInteractedRef.current &&
          profile &&
          typeof profile.isPrivate === "boolean"
        ) {
          setIsPrivate(profile.isPrivate);
        }
      } catch {
        // fail-soft: keep SSR value
      } finally {
        if (alive) setSynced(true);
      }
    }

    sync();

    return () => {
      alive = false;
    };
  }, []);

  async function handleToggle() {
    if (loading || !synced) return;

    hasUserInteractedRef.current = true;

    const next = !isPrivate;

    setLoading(true);
    setError(null);

    try {
      const res = await updateMyPrivacy(next);

      // backend authority
      if (res && typeof res.isPrivate === "boolean") {
        setIsPrivate(res.isPrivate);
      }
    } catch {
      setError(
        "Unable to update privacy setting. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || !synced;

  return (
    <section className="rounded border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-medium">Private account</h2>
          <p className="text-sm text-gray-600 mt-1">
            When private, only approved followers can see your
            posts and profile.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isDisabled}
          aria-pressed={isPrivate}
          aria-busy={loading}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            isPrivate ? "bg-blue-600" : "bg-gray-300",
            isDisabled
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white transition",
              isPrivate
                ? "translate-x-5"
                : "translate-x-1",
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





