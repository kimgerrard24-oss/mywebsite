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

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    try {
      await updateCover(file);
      await refreshUser();
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <h2 className="text-lg font-medium">Cover photo</h2>
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
        <label className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white">
          Change cover
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      </div>

      <UploadProgress loading={loading} error={error} />
    </article>
  );
}
