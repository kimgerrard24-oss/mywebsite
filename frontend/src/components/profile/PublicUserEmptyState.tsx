// components/profile/PublicUserEmptyState.tsx
type Props = {
  displayName?: string | null;
};

export default function PublicUserEmptyState({ displayName }: Props) {
 return (
  <div
    className="
      w-full
      rounded-xl
      sm:rounded-2xl
      border
      border-gray-200
      bg-white
      p-4
      sm:p-6
      md:p-8
      text-center
      text-gray-600
    "
    aria-live="polite"
    role="status"
  >
    <p
      className="
        text-sm
        sm:text-base
        font-medium
        text-gray-700
      "
    >
      {displayName ?? "This user"} hasn’t posted yet
    </p>

    <p
      className="
        mt-1
        text-xs
        sm:text-sm
        text-gray-500
      "
    >
      When they share something, it will appear here.
    </p>
  </div>
);

}
