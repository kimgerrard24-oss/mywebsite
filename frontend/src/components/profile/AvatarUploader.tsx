// frontend/src/components/profile/AvatarUploader.tsx
import { useRef } from 'react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, loading, error } = useAvatarUpload();

  return (
    <div className="avatar-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.currentTarget.value = '';
        }}
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="btn"
      >
        {loading ? 'Uploading…' : 'Change avatar'}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
