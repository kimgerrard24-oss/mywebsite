// frontend/src/components/account/PrivacySettingToggle.tsx

"use client";

import { useState } from "react";
import { updateMyPrivacy } from "@/lib/api/user-privacy";

type Props = {
  initialIsPrivate: boolean; // SSR = source of truth
};

export default function PrivacySettingToggle({
  initialIsPrivate,
}: Props) {
  // start with SSR value
  const [isPrivate, setIsPrivate] =
    useState<boolean>(initialIsPrivate);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (loading) return;

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

  const isDisabled = loading;

  return (
  <section
    className="w-full rounded-lg border border-gray-200 bg-white p-4 sm:p-5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
    role="region"
    aria-labelledby="private-account-title"
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2
          id="private-account-title"
          className="text-sm font-medium text-gray-900"
        >
          Private account
        </h2>

        <p className="mt-1 text-xs sm:text-sm text-gray-600">
          When private, only approved followers can see your posts and profile.
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        aria-pressed={isPrivate}
        aria-busy={loading}
        aria-label={
          isPrivate
            ? "Disable private account"
            : "Enable private account"
        }
        className={[
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          isPrivate ? "bg-blue-600" : "bg-gray-300",
          isDisabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200",
            isPrivate
              ? "translate-x-5"
              : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>

    {error && (
      <p
        className="mt-3 text-xs sm:text-sm text-red-600"
        role="alert"
        aria-live="assertive"
      >
        {error}
      </p>
    )}
  </section>
);

}






