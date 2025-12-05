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
 * นี่คือ type ใหม่ หลังเพิ่ม blockDuration
 * เพื่อรองรับการ block หลัง exceed
 */
export type RateLimitConfig = {
  points: number;
  duration: number;
  blockDuration?: number;
};

/**
 * ค่า policy สำหรับแต่ละ action
 * points = จำนวนครั้งที่อนุญาตภายใน duration
 * duration = หน่วยเป็นวินาที
 * blockDuration = เวลาบล็อก (หน่วยเป็นวินาที)
 *
 * หมายเหตุ:
 * - ใช้มาตรฐาน production security
 * - บล็อกเข้มสำหรับ login เพื่อกัน brute-force
 */
export const RateLimitPolicy: Record<RateLimitAction, RateLimitConfig> = {
  /**
   * Auth brute-force rate-limit (action-level)
   * (Brute-force limiter ตัวจริงอยู่ใน RateLimitGuard อีกชั้น)
   */
  login: {
    points: 10,
    duration: 60,
    blockDuration: 300, // 5 นาที
  },

  /**
   * Registration: ใช้ค่าตามมาตรฐาน production
   */
  register: {
    points: 6,
    duration: 60,
    blockDuration: 600, // 10 นาที
  },

  resetPassword: {
    points: 3,
    duration: 3600,
    blockDuration: 1800, // 30 นาที
  },

  /**
   * Posting limits
   */
  postCreate: {
    points: 15,
    duration: 60,
    blockDuration: 120, // 2 นาที
  },

  commentCreate: {
    points: 30,
    duration: 60,
    blockDuration: 120, // 2 นาที
  },

  /**
   * Social actions
   */
  followUser: {
    points: 50,
    duration: 3600,
    blockDuration: 3600, // 1 ชั่วโมง
  },

  unfollowUser: {
    points: 50,
    duration: 3600,
    blockDuration: 3600, // 1 ชั่วโมง
  },

  /**
   * Messaging (anti bot)
   */
  messagingSend: {
    points: 60,
    duration: 60,
    blockDuration: 300, // 5 นาที
  },

  /**
   * OAuth redirects
   */
  oauth: {
    points: 20,
    duration: 60,
    blockDuration: 120, // 2 นาที
  },
};
