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
      /**
       * สำคัญมาก:
       * reset value เพื่อให้เลือกไฟล์เดิมซ้ำได้
       */
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
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="
          inline-flex items-center justify-center
          rounded-md border border-gray-300
          bg-white px-4 py-2
          text-sm font-medium text-gray-700
          hover:bg-gray-50
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        {loading ? "กำลังอัปโหลดรูปโปรไฟล์…" : "เปลี่ยนรูปโปรไฟล์"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
