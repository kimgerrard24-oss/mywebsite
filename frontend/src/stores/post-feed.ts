// frontend/src/stores/post-feed.ts
import { useCallback } from 'react';

type PostBase = {
  id: string;
};

type RemoveFn = (postId: string) => void;

/**
 * Utility สำหรับ update feed แบบไม่ reload หน้า
 * (ใช้ร่วมกับ state / SWR / React cache ใด ๆ ก็ได้)
 */
export function usePostFeedUpdater<T extends PostBase>(
  setPosts: React.Dispatch<React.SetStateAction<T[]>>
) {
  const removeFromFeed: RemoveFn = useCallback(
    (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [setPosts],
  );

  return { removeFromFeed };
}
