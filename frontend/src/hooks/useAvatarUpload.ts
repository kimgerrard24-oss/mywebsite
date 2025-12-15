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

      const result = await updateUserAvatar(file);

      if (!result?.success || !result.avatarUrl) {
        throw new Error('Upload failed');
      }

      // ปล่อยให้ caller หรือ AuthContext / ProfileContext
      // เป็นคน update avatarUrl เอง
      return result.avatarUrl;
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { upload, loading, error };
}
