// frontend/src/components/profile/AvatarUploader.tsx

import { useRef } from "react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, loading, error } = useAvatarUpload();

  async function handleFileChange(
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
    <div className="w-full flex flex-col gap-2 sm:gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
        aria-hidden="true"
      />

      <button
        type="button"
        aria-haspopup="dialog"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center w-full sm:w-auto rounded-md sm:rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        aria-busy={loading}
      >
        {loading
          ? "กำลังอัปโหลดรูปโปรไฟล์…"
          : "เปลี่ยนรูปโปรไฟล์"}
      </button>

      {error && (
        <p
          className="text-xs sm:text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
