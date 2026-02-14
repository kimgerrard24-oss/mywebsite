// frontend/src/components/profile/DeleteProfileMediaButton.tsx

"use client";

import { useDeleteProfileMedia } from "@/hooks/useDeleteProfileMedia";

type Props = {
  mediaId: string;
  onDeleted?: () => void;
};

export function DeleteProfileMediaButton({
  mediaId,
  onDeleted,
}: Props) {
  const { deleteProfileMedia, loading, error } =
    useDeleteProfileMedia();

  const handleClick = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this profile media?",
    );

    if (!confirmed) return;

    const success = await deleteProfileMedia(mediaId);

    if (success) {
      onDeleted?.();
    }
  };

  return (
  <div className="flex flex-col gap-1.5">
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="
        inline-flex
        items-center
        gap-1.5
        text-sm
        font-medium
        text-red-600
        hover:text-red-700
        hover:bg-red-50
        px-3
        py-1.5
        rounded-md
        transition
        duration-150
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {loading ? (
        "Deleting..."
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1 0-1.5H9v-.75Zm-2.25 6a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 .75.75v8.25A2.25 2.25 0 0 1 15 20.25H9A2.25 2.25 0 0 1 6.75 18V9.75Z"
              clipRule="evenodd"
            />
          </svg>
          Delete
        </>
      )}
    </button>

    {error && (
      <p className="text-xs text-red-600">{error}</p>
    )}
  </div>
);

}

