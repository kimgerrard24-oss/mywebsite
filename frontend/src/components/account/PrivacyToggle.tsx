// frontend/src/components/account/PrivacyToggle.tsx

"use client";

import { usePostPrivacy } from "@/hooks/usePostPrivacy";

type Props = {
  initialIsPrivate: boolean; // SSR authority
};

export default function PrivacySettingToggle({
  initialIsPrivate,
}: Props) {
  const {
    isPrivate,
    loading,
    error,
    toggle,
  } = usePostPrivacy(initialIsPrivate);

 return (
  <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h3
        className="text-sm font-medium text-gray-900"
        id="private-account-heading"
      >
        Private account
      </h3>

      <p className="mt-1 text-xs sm:text-sm text-gray-600">
        When private, only approved followers can see your posts and profile.
      </p>
    </div>

    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={isPrivate}
        aria-busy={loading}
        aria-labelledby="private-account-heading"
        aria-label={
          isPrivate
            ? "Disable private account"
            : "Enable private account"
        }
        className={[
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          isPrivate ? "bg-blue-600" : "bg-gray-300",
          loading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200",
            isPrivate ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </button>

      {error && (
        <p
          className="text-xs text-red-600"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </div>
  </div>
);

}
