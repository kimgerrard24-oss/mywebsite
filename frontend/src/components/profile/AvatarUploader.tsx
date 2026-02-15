// frontend/src/components/profile/AvatarUploader.tsx

import { useRef, useState } from "react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { useAuth } from "@/context/AuthContext";
import { useProfileUpdateStore } from "@/stores/profile-update.store";
import type { PostVisibility } from "@/types/profile-update";
import { createProfileUpdateDraft } from "@/lib/api/profile-update";

type Props = {
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export function AvatarUploader({ currentMedia }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, loading, error } = useAvatarUpload();
  const { refreshUser } = useAuth();

  const { refetch, setAvatarLocally } = currentMedia;

  /**
   * Bind uploaded media to composer draft
   */
  const { draft, setDraft } = useProfileUpdateStore();

  const [success, setSuccess] = useState(false);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccess(false);

    try {
      /**
       * Upload avatar
       */
      const uploaded = await upload(file);

      /**
       * ====================================================
       * PRODUCTION CRITICAL FIX
       *
       * Ensure draft always exists before updating mediaId
       * ====================================================
       */
      if (uploaded?.mediaId) {

  /**
   * CRITICAL: create draft in backend
   * backend is authority
   */
  const newDraft = await createProfileUpdateDraft({

    mediaId: uploaded.mediaId,

    content: draft?.content ?? undefined,

    visibility: draft?.visibility ?? ("PUBLIC" as PostVisibility),


  });

  /**
   * sync zustand store with backend draft
   */
  setDraft(newDraft);

}


      /**
       * Optimistic UI update
       */
      if (uploaded?.url) {
        setAvatarLocally(uploaded.url);
      }

      /**
       * Sync auth context
       */
      await refreshUser();

      /**
       * Sync profile media source of truth
       */
      await refetch();

      setSuccess(true);

    } catch {
      /**
       * error handled in hook
       */
    } finally {

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
      <h2 id="avatar-upload-heading" className="sr-only">
        เปลี่ยนรูปโปรไฟล์
      </h2>

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
      >
        {loading
          ? "กำลังอัปโหลดรูปโปรไฟล์…"
          : "เปลี่ยนรูปโปรไฟล์"}
      </button>

      {success && (
        <p className="text-xs sm:text-sm text-green-600">
          อัปเดตรูปโปรไฟล์สำเร็จ
        </p>
      )}

      {error && (
        <p className="text-xs sm:text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
