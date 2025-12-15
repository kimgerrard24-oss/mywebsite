// frontend/src/hooks/useAvatarUpload.ts
import { useState } from 'react';
import { updateUserAvatar } from '@/lib/api/user';
import { validateAvatarFile } from '@/lib/upload/avatar-upload';

export function useAvatarUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    try {
      setError(null);
      validateAvatarFile(file);

      setLoading(true);
      await updateUserAvatar(file);

      window.location.reload();
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return { upload, loading, error };
}
