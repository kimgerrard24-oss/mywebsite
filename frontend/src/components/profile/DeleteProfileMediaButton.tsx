// frontend/src/components/profile/DeleteProfileMediaButton.tsx

"use client";

import { useDeleteProfileMedia } from "@/hooks/useDeleteProfileMedia";

type Props = {
  mediaId: string;
};

export function DeleteProfileMediaButton({ mediaId }: Props) {
  const { deleteProfileMedia, loading, error } =
    useDeleteProfileMedia();

  const handleClick = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this profile media?",
    );

    if (!confirmed) return;

    await deleteProfileMedia(mediaId);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
