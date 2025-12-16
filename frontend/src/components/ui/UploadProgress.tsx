// frontend/components/ui/UploadProgress.tsx
type Props = {
  loading: boolean;
  error: string | null;
};

export default function UploadProgress({ loading, error }: Props) {
  if (!loading && !error) return null;

  return (
    <div className="mt-3 text-sm">
      {loading && (
        <p className="text-gray-600">Uploading cover photo…</p>
      )}
      {error && (
        <p className="text-red-600">{error}</p>
      )}
    </div>
  );
}
