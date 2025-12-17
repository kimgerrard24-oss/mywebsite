// backend/src/common/rate-limit/post-create.limit.ts
/**
 * Placeholder สำหรับ future integration
 * เช่น Redis sliding window / token bucket
 *
 * ตอนนี้ยังไม่ bind เพื่อไม่กระทบ auth system
 */
export const POST_CREATE_RATE_LIMIT = {
  windowSeconds: 60,
  maxRequests: 5,
};
