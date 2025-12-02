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
  | 'ip';

/**
 * ค่า policy สำหรับแต่ละ action
 * points = จำนวนครั้งที่อนุญาตภายใน duration
 * duration = หน่วยเป็นวินาที
 *
 * หมายเหตุ:
 * - ip-level limit ใช้กับ unauthenticated user
 * - login/register ต้องกัน brute-force
 */
export const RateLimitPolicy: Record<
  RateLimitAction,
  { points: number; duration: number }
> = {
  /**
   * Global IP-level rate limit
   * - ใช้กับ unauthenticated requests เช่น register/login ก่อนสร้าง session
   */
  ip: { points: 1500, duration: 60 }, // 1500 requests / minute ต่อ 1 IP

  // Auth-related actions (security goal: block brute-force)
  login: { points: 5, duration: 60 },       // 5 ครั้ง / นาที
  
  // ปรับให้เหมาะสม (กัน brute-force + ไม่ block ผู้ใช้จริงง่ายเกินไป)
  register: { points: 10, duration: 600 },  // 10 ครั้ง / 10 นาที

  resetPassword: { points: 3, duration: 3600 }, // 3 ครั้ง / ชั่วโมง

  // Posting actions (anti-spam)
  postCreate: { points: 15, duration: 60 },
  commentCreate: { points: 30, duration: 60 },

  // Social actions
  followUser: { points: 50, duration: 3600 },
  unfollowUser: { points: 50, duration: 3600 },

  // Messaging (anti-bot spam)
  messagingSend: { points: 60, duration: 60 },
};
