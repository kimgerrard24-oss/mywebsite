// frontend/src/components/posts/PostShareStats.tsx

import { usePostShareStats } from "@/hooks/usePostShareStats";

type Props = {
  postId: string;
};

export default function PostShareStats({ postId }: Props) {
  const { stats, loading } = usePostShareStats(postId);

  // ===== Fail-soft UX =====
  if (loading) return null;
  if (!stats) return null;

  const total =
    stats.internalShareCount +
    stats.externalShareCount;

  if (total === 0) return null;

  return (
    <div
      className="
        mt-2
        text-xs
        text-gray-500
        flex
        items-center
        gap-3
      "
      aria-label="Post share statistics"
    >
      <span>
        🔁 {total.toLocaleString()} shares
      </span>

      {stats.externalShareCount > 0 && (
        <span>
          🌐 {stats.externalShareCount.toLocaleString()}
        </span>
      )}

      {stats.internalShareCount > 0 && (
        <span>
          💬 {stats.internalShareCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}
