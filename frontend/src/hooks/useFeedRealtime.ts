// frontend/src/hooks/useFeedRealtime.ts

import { useEffect } from "react";
import { bindSocketEvent } from "@/lib/socket";
import { useFeedStore } from "@/stores/feed.store";

/**
 * Feed Realtime Hook
 *
 * Responsibilities:
 * - Listen to Notification domain realtime only
 * - React only to feed-related notification types
 * - NEVER connect socket here (lifecycle handled elsewhere)
 * - NEVER mutate feed items directly (HTTP remains authority)
 */
export function useFeedRealtime() {
  const invalidate = useFeedStore((s) => s.invalidate);

  useEffect(() => {
    function onNotification(payload: any) {
      const n = payload?.notification;
      if (!n || typeof n.type !== "string") return;

      /**
       * Feed-related realtime signals
       * Backend emits via NotificationRealtimeService only
       */
      if (
        n.type === "feed_new_post" ||
        n.type === "feed_repost" ||
        n.type === "feed_mention_in_post"
      ) {
        /**
         * IMPORTANT:
         * - Do NOT insert post into feed
         * - Do NOT trust realtime payload for business data
         * - Only mark feed as stale and let HTTP refetch decide
         */
        invalidate("new-post");
      }
    }

    // Centralized binding (dedupe-safe)
    bindSocketEvent("notification:new", onNotification);

    return () => {
      // bindSocketEvent already handles off/on safely,
      // but keep symmetry in case implementation changes
      // (no direct socket access here by design)
    };
  }, [invalidate]);
}
