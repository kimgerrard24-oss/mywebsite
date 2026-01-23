// frontend/src/components/feed/FeedRealtimeBridge.tsx

"use client";

import { useEffect } from "react";
import { useFeedRealtime } from "@/hooks/useFeedRealtime";

/**
 * Feed Realtime Bridge (Client-only)
 *
 * Responsibilities:
 * - Mount once per Feed page/layout
 * - Delegate all realtime logic to useFeedRealtime()
 *
 * Rules:
 * - MUST NOT connect socket here
 * - MUST NOT bind socket events here
 * - MUST NOT touch feed state directly
 *
 * Socket lifecycle and auth are handled elsewhere (after /auth/session-check)
 */
export default function FeedRealtimeBridge() {
  // Hook encapsulates all realtime handling
  useFeedRealtime();

  // Defensive: ensure no SSR side-effects even if misused
  useEffect(() => {
    if (typeof window === "undefined") return;
  }, []);

  return null;
}
