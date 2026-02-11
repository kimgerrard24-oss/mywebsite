// frontend/src/components/profile/CoverUploader.tsx

import { useRef } from "react";
import { useCoverUpload } from "@/hooks/useCoverUpload";

export function CoverUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, loading, error } = useCoverUpload();

  async function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await upload(file);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="
          inline-flex
          items-center
          justify-center
          rounded-md
          border
          border-gray-300
          bg-white
          px-4
          py-2
          text-sm
          font-medium
          text-gray-700
          hover:bg-gray-50
          disabled:opacity-60
        "
      >
        {loading ? "กำลังอัปโหลดรูปปก…" : "เปลี่ยนรูปปก"}
      </button>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
