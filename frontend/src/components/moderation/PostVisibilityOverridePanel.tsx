// frontend/src/components/moderation/PostVisibilityOverridePanel.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useModerationOverrideVisibility } from "@/hooks/useModerationOverrideVisibility";

type Visibility = "PUBLIC" | "PRIVATE";

type Props = {
  postId: string;
  currentEffectiveVisibility: Visibility;
};

export default function PostVisibilityOverridePanel({
  postId,
  currentEffectiveVisibility,
}: Props) {
  const router = useRouter();
  const { override, loading, error } =
    useModerationOverrideVisibility(postId);

  const [reason, setReason] = useState("");
  const [confirming, setConfirming] =
    useState<Visibility | null>(null);

  const nextVisibility: Visibility =
    currentEffectiveVisibility === "PUBLIC"
      ? "PRIVATE"
      : "PUBLIC";

  async function handleConfirm() {
    if (!confirming) return;

    await override({
      visibility: confirming,
      reason: reason.trim() || "Admin override visibility",
    });

    setConfirming(null);

    // refresh page — backend authority
    router.replace(router.asPath);
  }

  return (
    <section className="rounded-lg border bg-white p-4">
      <h3 className="font-medium text-sm">
        Admin visibility override
      </h3>

      <p className="mt-1 text-xs text-gray-600">
        Effective visibility:{" "}
        <strong>{currentEffectiveVisibility}</strong>
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required for audit)"
        maxLength={500}
        className="
          mt-3
          w-full
          rounded
          border
          p-2
          text-sm
          focus:outline-none
          focus:ring
        "
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => setConfirming(nextVisibility)}
          className={[
            "rounded px-3 py-1.5 text-sm font-medium text-white",
            nextVisibility === "PRIVATE"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700",
            loading
              ? "opacity-60 cursor-not-allowed"
              : "",
          ].join(" ")}
        >
          {nextVisibility === "PRIVATE"
            ? "Force Private"
            : "Force Public"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* ===== Confirm Modal ===== */}
      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black/40
          "
        >
          <div className="w-full max-w-sm rounded bg-white p-4">
            <h4 className="font-medium text-sm">
              Confirm admin override
            </h4>

            <p className="mt-2 text-sm">
              Are you sure you want to force this post to{" "}
              <strong>{confirming}</strong>?
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="text-sm px-3 py-1.5 rounded border"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

