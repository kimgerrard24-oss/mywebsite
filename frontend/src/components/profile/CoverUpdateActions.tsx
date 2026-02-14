// frontend/src/components/profile/CoverUpdateActions.tsx

"use client";

export default function CoverUpdateActions({
  onSave,
  onPublish,
  loading,
}: {
  onSave: () => void;
  onPublish: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onSave}
        className="px-4 py-2 rounded-md border"
      >
        Save Draft
      </button>

      <button
        onClick={onPublish}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-blue-600 text-white"
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}
