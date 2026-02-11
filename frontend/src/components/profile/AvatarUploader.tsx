// frontend/src/components/profile/AvatarUploader.tsx

import { useRef, useState } from "react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, loading, error } = useAvatarUpload();

  const [success, setSuccess] = useState(false);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccess(false);

    try {
      await upload(file);
      setSuccess(true);
    } catch {
      // error handled in hook
    } finally {
      /**
       * สำคัญมาก:
       * reset input value เพื่อให้เลือกไฟล์เดิมซ้ำได้
       */
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <section
      aria-labelledby="avatar-upload-heading"
      className="w-full flex flex-col gap-2 sm:gap-3"
    >
      <h2
        id="avatar-upload-heading"
        className="sr-only"
      >
        เปลี่ยนรูปโปรไฟล์
      </h2>

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
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="
          inline-flex
          items-center
          justify-center
          w-full
          sm:w-auto
          rounded-md
          sm:rounded-lg
          border
          border-gray-300
          bg-white
          px-3
          sm:px-4
          py-2
          sm:py-2.5
          text-sm
          sm:text-base
          font-medium
          text-gray-700
          hover:bg-gray-50
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          disabled:opacity-60
          disabled:cursor-not-allowed
          transition
        "
        aria-busy={loading}
      >
        {loading
          ? "กำลังอัปโหลดรูปโปรไฟล์…"
          : "เปลี่ยนรูปโปรไฟล์"}
      </button>

      {success && (
        <p
          className="text-xs sm:text-sm text-green-600"
          role="status"
          aria-live="polite"
        >
          อัปเดตรูปโปรไฟล์สำเร็จ
        </p>
      )}

      {error && (
        <p
          className="text-xs sm:text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}
