/**
 * รายการ action ที่จะใช้ใน RateLimitGuard และ RateLimitService
 *
 * หมายเหตุ:
 * - action "ip" ถูกลบออก เพราะไปซ้ำกับ keyPrefix "ip:" ใน RateLimitGuard
 *   และทำให้เกิดการ block ผิดพลาด
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
   * Auth brute-force rate-limit (action-level)
   * (Brute-force limiter ตัวจริงอยู่ใน RateLimitGuard อีกชั้น)
   */
  login: { points: 10, duration: 60 },

  /**
   * Registration: ใช้ค่าตามมาตรฐาน production
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
   * OAuth redirects
   */
  oauth: { points: 20, duration: 60 },
};
