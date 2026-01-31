// frontend/src/components/posts/PostShareStats.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { usePostShareStats } from '@/hooks/usePostShareStats';

type Props = {
  postId: string;
};

export default function PostShareStats({ postId }: Props) {
  const { stats, loading, reload } = usePostShareStats(postId);

  // =========================
  // Live update after share
  // =========================
  useEffect(() => {
    function onShareUpdated(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.postId === postId) {
        reload(); // 🔁 re-fetch authoritative stats
      }
    }

    window.addEventListener(
      'post:share-updated',
      onShareUpdated,
    );
    return () => {
      window.removeEventListener(
        'post:share-updated',
        onShareUpdated,
      );
    };
  }, [postId, reload]);

  // =========================
  // Fail-soft rendering
  // =========================
  if (loading || !stats) return null;

  const total = useMemo(
    () =>
      stats.internalShareCount +
      stats.externalShareCount,
    [
      stats.internalShareCount,
      stats.externalShareCount,
    ],
  );

  if (total === 0) return null;

  // =========================
  // Render
  // =========================
  return (
    <div
      className="
        mt-2
        flex
        items-center
        gap-3
        text-xs
        text-gray-500
      "
      aria-label="Post share statistics"
      aria-live="polite"
    >
      {/* ===== Total ===== */}
      <span
        title="จำนวนการแชร์ทั้งหมด"
        className="whitespace-nowrap"
      >
        🔁 {total.toLocaleString()} shares
      </span>

      {/* ===== External ===== */}
      {stats.externalShareCount > 0 && (
        <span
          title="แชร์ออกภายนอก"
          className="whitespace-nowrap"
        >
          🌐{' '}
          {stats.externalShareCount.toLocaleString()}
        </span>
      )}

      {/* ===== Internal ===== */}
      {stats.internalShareCount > 0 && (
        <span
          title="แชร์ภายใน PhlyPhant"
          className="whitespace-nowrap"
        >
          💬{' '}
          {stats.internalShareCount.toLocaleString()}
        </span>
      )}

      {/* ===== Updated hint (subtle UX) ===== */}
      {stats.updatedAt && (
        <time
          dateTime={stats.updatedAt}
          className="sr-only"
        >
          Updated at {stats.updatedAt}
        </time>
      )}
    </div>
  );
}
