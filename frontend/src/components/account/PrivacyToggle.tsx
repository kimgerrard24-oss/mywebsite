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
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="font-medium">Private account</h3>
        <p className="mt-1 text-sm text-gray-600">
          When private, only approved followers can see your posts
          and profile.
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          aria-pressed={isPrivate}
          aria-busy={loading}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            isPrivate ? "bg-blue-600" : "bg-gray-300",
            loading
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

        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
