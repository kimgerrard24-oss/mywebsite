// frontend/components/profile/CoverUploader.tsx
import { useState, ChangeEvent } from 'react';
import { updateCover } from '@/lib/api/user';
import UploadProgress from '@/components/ui/UploadProgress';
import { useAuth } from '@/context/AuthContext';

type Props = {
  currentCoverUrl?: string | null;
};

export default function CoverUploader({ currentCoverUrl }: Props) {
  const { refreshUser } = useAuth();

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const res = await updateCover(file);

      // ใช้ coverUrl ที่ backend ส่งกลับมาเป็น source ทันที
      if (res?.coverUrl) {
        setPreview(res.coverUrl);
      }

      // sync user context
      await refreshUser();

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
    } finally {
      setLoading(false);
      URL.revokeObjectURL(objectUrl);
      e.target.value = '';
    }
  };

  return (
    <article aria-labelledby="cover-heading">
      <h2 id="cover-heading" className="text-lg font-medium">
        Cover photo
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        This image appears at the top of your profile
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border">
        {preview || currentCoverUrl ? (
          <img
            src={preview ?? currentCoverUrl ?? ''}
            alt="Cover preview"
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center text-gray-400">
            No cover photo
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label
          className={`cursor-pointer rounded-md px-4 py-2 text-sm text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black'
          }`}
        >
          {loading ? 'Uploading…' : 'Change cover'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={loading}
          />
        </label>

        {success && (
          <span className="text-sm text-green-600">
            Cover updated successfully
          </span>
        )}
      </div>

      <UploadProgress loading={loading} error={error} />
    </article>
  );
}
