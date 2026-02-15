// frontend/src/components/profile/CoverUploader.tsx

import { useEffect, useRef, useState } from "react";
import { useCoverUpload } from "@/hooks/useCoverUpload";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { useAuth } from "@/context/AuthContext";
import { useCoverUpdateStore } from "@/stores/cover-update.store";
import type { PostVisibility } from "@/types/profile-update";
import { createProfileUpdateDraft } from "@/lib/api/profile-update";

type Props = {
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
  caption?: string;
};

export function CoverUploader({ currentMedia, caption }: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, loading, error } = useCoverUpload();
  const { refreshUser } = useAuth();

  const { data, refetch } = currentMedia;

  /**
   * Bind uploaded media to composer draft
   * cover uses cover-update store
   */
  const { draft, setDraft } = useCoverUpdateStore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * cleanup object URL
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {

    const file = e.target.files?.[0];
    if (!file) return;

    setSuccess(false);

    /**
     * optimistic preview
     */
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {

      /**
       * upload cover (authoritative backend)
       */
      const uploaded = await upload(file, caption);

      /**
       * ====================================================
       * PRODUCTION CRITICAL FIX
       * Ensure draft exists and bind mediaId
       * ====================================================
       */
      if (uploaded?.mediaId) {

        const newDraft = await createProfileUpdateDraft({

          mediaId: uploaded.mediaId,

          content: draft?.content ?? caption ?? undefined,

          visibility:
            draft?.visibility ??
            ("PUBLIC" as PostVisibility),

        });

        setDraft(newDraft);

      }

      /**
       * Sync auth context (source of truth)
       */
      await refreshUser();

      /**
       * Sync profile media authoritative source
       */
      await refetch();

      setSuccess(true);

      /**
       * remove preview after success
       */
      setPreviewUrl(null);

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

  /**
   * image source priority:
   * preview → backend → null
   */
  const imageSrc =
    previewUrl ??
    data?.cover?.url ??
    null;

  return (

    <article className="flex flex-col gap-4">

      {/* preview */}
      <div className="overflow-hidden rounded-lg border">

        {imageSrc ? (

          <img
            src={imageSrc}
            alt="Cover image"
            className="h-48 w-full object-cover"
          />

        ) : (

          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            No cover photo
          </div>

        )}

      </div>

      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      {/* upload button */}
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
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          disabled:opacity-60
          disabled:cursor-not-allowed
          transition
        "
      >

        {loading
          ? "กำลังอัปโหลดรูปปก…"
          : "เปลี่ยนรูปปก"}

      </button>

      {/* success */}
      {success && (

        <p className="text-sm text-green-600">
          อัปเดตรูปปกสำเร็จ
        </p>

      )}

      {/* error */}
      {error && (

        <p
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>

      )}

    </article>

  );

}
