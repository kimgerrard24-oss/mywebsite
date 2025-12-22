// frontend/components/ui/UploadProgress.tsx
type Props = {
  loading: boolean;
  error: string | null;
};

export default function UploadProgress({ loading, error }: Props) {
  if (!loading && !error) return null;

 return (
  <div
    className="
      mt-2
      sm:mt-3
      text-xs
      sm:text-sm
    "
    aria-live="polite"
  >
    {loading && (
      <p
        className="
          text-gray-600
        "
        role="status"
      >
        Uploading cover photo…
      </p>
    )}

    {error && (
      <p
        className="
          text-red-600
        "
        role="alert"
      >
        {error}
      </p>
    )}
  </div>
);

}
