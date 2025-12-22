// frontend/components/profile/CoverUploader.tsx
import { useState, ChangeEvent, useEffect } from 'react';
import { updateCover } from '@/lib/api/user';
import UploadProgress from '@/components/ui/UploadProgress';
import { useAuth } from '@/context/AuthContext';
import { validateCoverFile } from '@/lib/upload/cover-upload';

type Props = {
  currentCoverUrl: string | null;
};

export default function CoverUploader({ currentCoverUrl }: Props) {
  const { refreshUser } = useAuth();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(currentCoverUrl);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCoverUrl(currentCoverUrl);
  }, [currentCoverUrl]);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateCoverFile(file);
    } catch (err: any) {
      setError(err?.message ?? 'Invalid cover file');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const res = await updateCover(file);

      if (res && typeof res.coverUrl === 'string') {
        setCoverUrl(res.coverUrl);
      }

      refreshUser().catch(() => null);

      setSuccess(true);
      setPreviewUrl(null);
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
    } finally {
      setLoading(false);
      URL.revokeObjectURL(objectUrl);
      e.target.value = '';
    }
  };

  const imageSrc = previewUrl ?? coverUrl;

 return (
  <article
    aria-labelledby="cover-heading"
    className="
      w-full
      max-w-4xl
      mx-auto
    "
  >
    <h2
      id="cover-heading"
      className="
        text-base
        sm:text-lg
        font-medium
      "
    >
      Cover photo
    </h2>

    <p
      className="
        mt-1
        text-xs
        sm:text-sm
        text-gray-600
      "
    >
      This image appears at the top of your profile
    </p>

    <div
      className="
        mt-3
        sm:mt-4
        overflow-hidden
        rounded-lg
        sm:rounded-xl
        border
      "
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Cover image"
          loading="lazy"
          className="
            h-36
            sm:h-48
            md:h-56
            w-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            flex
            h-36
            sm:h-48
            md:h-56
            items-center
            justify-center
            text-xs
            sm:text-sm
            text-gray-400
          "
        >
          No cover photo
        </div>
      )}
    </div>

    <div
      className="
        mt-3
        sm:mt-4
        flex
        flex-col
        sm:flex-row
        sm:items-center
        gap-2
        sm:gap-4
      "
    >
      <label
        className={`
          inline-flex
          items-center
          justify-center
          cursor-pointer
          rounded-md
          sm:rounded-lg
          px-3
          sm:px-4
          py-2
          text-xs
          sm:text-sm
          font-medium
          text-white
          transition
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }
        `}
      >
        {loading ? "Uploading…" : "Change cover"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={loading}
          aria-hidden="true"
        />
      </label>

      {success && (
        <span
          className="
            text-xs
            sm:text-sm
            text-green-600
          "
          role="status"
          aria-live="polite"
        >
          Cover updated successfully
        </span>
      )}
    </div>

    <div className="mt-2 sm:mt-3">
      <UploadProgress loading={loading} error={error} />
    </div>
  </article>
);

}
