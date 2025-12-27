// frontend/src/components/feed/FeedRealtimeBridge.tsx

import { useFeedRealtime } from '@/hooks/useFeedRealtime';

/**
 * Feed Realtime Bridge
 *
 * - ไม่มี UI
 * - mount ครั้งเดียว (เช่นใน FeedLayout)
 * - ทำหน้าที่รับ realtime signal เท่านั้น
 */
export default function FeedRealtimeBridge() {
  useFeedRealtime();
  return null;
}
