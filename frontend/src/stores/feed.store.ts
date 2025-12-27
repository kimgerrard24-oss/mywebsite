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

export const useFeedStore =
  create<FeedState>((set) => ({
    shouldRefresh: false,
    lastInvalidateReason: null,

    invalidate: (reason) =>
      set(() => ({
        shouldRefresh: true,
        lastInvalidateReason: reason,
      })),

    markRefreshed: () =>
      set(() => ({
        shouldRefresh: false,
        lastInvalidateReason: null,
      })),
  }));
