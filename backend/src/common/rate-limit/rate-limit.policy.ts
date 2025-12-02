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
 *
 * หมายเหตุสำคัญ:
 * - ip-level limit ถูกตั้งให้สูง เพราะ production มี reverse proxy (Caddy)
 *   และเราใช้ userId เป็น key เมื่อผู้ใช้ authenticated แล้ว
 * - ค่า login/register/reset-password ใช้เพื่อป้องกัน brute-force
 * - ค่า post/comment/follow ถูกปรับให้เหมาะสำหรับ social media ที่มี user ฐานกลาง–ใหญ่
 */
export const RateLimitPolicy: Record<
  RateLimitAction,
  { points: number; duration: number }
> = {
  /**
   * Global IP-level rate limit
   * - ตั้งให้สูง เพราะ production ใช้ reverse proxy
   * - ถ้า user login แล้ว ระบบจะใช้ userId-based rate limit แทนเสมอ
   */
  ip: { points: 1500, duration: 60 }, // 1500 requests / minute ต่อ 1 IP

  // Auth-related actions (security goal: protect against brute-force)
  login: { points: 5, duration: 60 },            // 5 ครั้ง / นาที

  // ปรับ register ให้เหมาะสม ปลอดภัย และไม่ block ผู้ใช้ปกติ
  register: { points: 10, duration: 600 },       // 10 ครั้ง / 10 นาที

  resetPassword: { points: 3, duration: 3600 },  // 3 ครั้ง / ชั่วโมง

  // Posting actions (anti-spam)
  postCreate: { points: 15, duration: 60 },      // 15 โพสต์ / นาที
  commentCreate: { points: 30, duration: 60 },   // 30 คอมเมนต์ / นาที

  // Social actions
  followUser: { points: 50, duration: 3600 },    // 50 follows / ชั่วโมง
  unfollowUser: { points: 50, duration: 3600 },  // กัน follow-unfollow spam

  // Messaging (anti-bot spam)
  messagingSend: { points: 60, duration: 60 },   // 60 ข้อความ / นาที
};
