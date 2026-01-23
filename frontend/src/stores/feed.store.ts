// frontend/src/stores/feed.store.ts

import { create } from 'zustand';

export type FeedInvalidateReason =
  | 'new-post'
  | 'privacy-change';

type FeedState = {
  /**
   * ใช้บอก UI ว่า feed ควรถูก refresh
   * ❗ ไม่ reorder / insert post ตรง ๆ
   */
  shouldRefresh: boolean;

  /**
   * เก็บ reason ไว้ debug / analytics
   */
  lastInvalidateReason:
    | FeedInvalidateReason
    | null;

    /**
   * เวลา invalidate ล่าสุด (ms)
   * ใช้กัน spam จาก realtime burst
   */
  lastInvalidateAt: number | null;  
    
  /**
   * realtime signal
   */
  invalidate: (
    reason: FeedInvalidateReason,
  ) => void;

  /**
   * reset หลัง refresh feed สำเร็จ
   */
  markRefreshed: () => void;
};

const INVALIDATE_DEBOUNCE_MS = 3000;

export const useFeedStore = create<FeedState>((set, get) => ({
  shouldRefresh: false,
  lastInvalidateReason: null,
  lastInvalidateAt: null,

  invalidate: (reason) => {
    const now = Date.now();
    const lastAt = get().lastInvalidateAt;

    /**
     * 🛡️ Debounce realtime burst
     * เช่น follower post ติด ๆ กัน หรือ reconnect replay
     */
    if (lastAt && now - lastAt < INVALIDATE_DEBOUNCE_MS) {
      return;
    }

    set(() => ({
      shouldRefresh: true,
      lastInvalidateReason: reason,
      lastInvalidateAt: now,
    }));
  },

  markRefreshed: () =>
    set(() => ({
      shouldRefresh: false,
      lastInvalidateReason: null,
      // keep lastInvalidateAt for debounce window
    })),
}));
