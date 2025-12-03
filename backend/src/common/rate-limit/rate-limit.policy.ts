/**
 * รายการ action ที่จะใช้ใน RateLimitGuard และ RateLimitService
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
  | 'ip'
  | 'oauth';

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
   * Global IP-level rate limit (unauthenticated)
   */
  ip: { points: 1500, duration: 60 },

  /**
   * Auth brute-force protection
   */
  login: { points: 5, duration: 60 },

  /**
   * แก้ไขตรงนี้ — register ต้องไม่หนักเกินไปจน block ผู้ใช้จริง
   * เดิม 10 ครั้ง / 10 นาที ทำให้โดน block ง่ายเกินไป
   * ใช้รูปแบบที่ปลอดภัยและใช้งานจริงทั่วโลก:
   * 6 ครั้ง / 1 นาที
   */
  register: { points: 6, duration: 60 },

  resetPassword: { points: 3, duration: 3600 },

  /**
   * Posting limits
   */
  postCreate: { points: 15, duration: 60 },
  commentCreate: { points: 30, duration: 60 },

  /**
   * Social actions
   */
  followUser: { points: 50, duration: 3600 },
  unfollowUser: { points: 50, duration: 3600 },

  /**
   * Messaging (anti bot)
   */
  messagingSend: { points: 60, duration: 60 },

  /**
   * OAuth (Google/Facebook redirect)
   */
  oauth: { points: 20, duration: 60 },
};
