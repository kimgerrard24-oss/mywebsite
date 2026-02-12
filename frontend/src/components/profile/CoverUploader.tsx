// frontend/src/components/profile/CoverUploader.tsx

import { useEffect, useRef, useState } from "react";
import { useCoverUpload } from "@/hooks/useCoverUpload";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { useAuth } from "@/context/AuthContext";

type Props = {
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export function CoverUploader({ currentMedia }: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

  const { user, refreshUser } = useAuth();
  const userId = user?.id ?? null;

  const { upload, loading, error } = useCoverUpload();
  const { data, refetch } = useCurrentProfileMedia(userId);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      await upload(file);

      // ✅ refresh auth user (if coverUrl stored there)
      await refreshUser();

      // ✅ refetch profile media current
      await refetch();

      setSuccess(true);
      setPreviewUrl(null);
    } catch {
      // error handled by hook
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  const imageSrc =
    previewUrl ??
    data?.cover?.url ??
    null;

  return (
    <article className="flex flex-col gap-4">
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

      {success && (
        <p className="text-sm text-green-600">
          อัปเดตรูปปกสำเร็จ
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
