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
    <div className="flex gap-2">
      <button
        onClick={onSave}
        className="px-4 py-2 bg-gray-200 rounded-lg"
      >
        Save Draft
      </button>

      <button
        onClick={onPublish}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}
