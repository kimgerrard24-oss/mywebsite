// src/common/rate-limit/rate-limit.policy.ts

/**
 * รายการ action ที่จะใช้ใน RateLimitGuard และ RateLimitService
 * หมายเหตุ:
 * - health-check endpoint ไม่ได้ใช้ action ใด ๆ ในนี้
 * - การ skip health-check ทำใน RateLimitGuard เท่านั้น
 */
export type RateLimitAction =
  | 'login'
  | 'register'
  | 'resetPassword'
  | 'postCreate'
  | 'commentCreate'
  | 'followUser'
  | 'unfollowUser'
  | 'messagingSend'
  | 'ip';

/**
 * ค่า policy สำหรับแต่ละ action
 * points = จำนวนครั้งที่อนุญาตภายใน duration
 * duration = หน่วยเป็นวินาที
 */
export const RateLimitPolicy: Record<
  RateLimitAction,
  { points: number; duration: number }
> = {
  /**
   * Global IP-level rate limit
   * ค่า 1000/minute เหมาะสำหรับ production
   * เพื่อไม่ให้ user ได้รับ 429 โดยไม่จำเป็น
   */
  ip: { points: 1000, duration: 60 },

  // Auth-related actions
  login: { points: 5, duration: 60 },
  register: { points: 3, duration: 3600 },
  resetPassword: { points: 3, duration: 3600 },

  // Posting actions
  postCreate: { points: 10, duration: 60 },
  commentCreate: { points: 15, duration: 60 },

  // Social actions
  followUser: { points: 20, duration: 3600 },
  unfollowUser: { points: 20, duration: 3600 },

  // Messaging
  messagingSend: { points: 30, duration: 60 },
};
