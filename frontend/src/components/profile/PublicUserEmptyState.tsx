// components/profile/PublicUserEmptyState.tsx
type Props = {
  displayName?: string | null;
};

export default function PublicUserEmptyState({ displayName }: Props) {
  return (
    <div
      className="rounded-2xl border bg-white p-8 text-center text-gray-600"
      aria-live="polite"
    >
      <p className="text-base font-medium">
        {displayName ?? "This user"} hasn’t posted yet
      </p>
      <p className="mt-1 text-sm text-gray-500">
        When they share something, it will appear here.
      </p>
    </div>
  );
}
