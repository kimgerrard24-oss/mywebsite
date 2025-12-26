/**
 * รายการ action สำหรับ RateLimitGuard และ RateLimitService
 */
export type RateLimitAction =
  | 'login'
  | 'register'
  | 'resetPassword'
  | 'postCreate'
  | 'commentCreate'
  | 'followUser'
  | 'updateAvatar'
  | 'updateCover'
  | 'unfollowUser'
  | 'commentUpdate'   
  | 'commentDelete'
  | 'messagingSend'
  | 'oauth'
  | 'logout';

export type RateLimitConfig = {
  // old structure (still used in service)
  points: number;
  duration: number;
  blockDuration?: number;

  // new structure for clarity
  windowSec: number;
  max: number;
  blockDurationSec: number;
};

/**
 * RateLimitPolicy — Production configuration
 */
export const RateLimitPolicy: Record<RateLimitAction, RateLimitConfig> = {
  login: {
    /**
     * ป้องกัน brute-force login
     */
    points: 10,
    duration: 60,
    blockDuration: 300,

    // new format (explicit)
    windowSec: 60,       // window
    max: 5,              // allow 5 attempts
    blockDurationSec: 60 // block for 1 minute
  },

  register: {
    points: 6,
    duration: 60,
    blockDuration: 600,

    windowSec: 60,
    max: 6,
    blockDurationSec: 600,
  },

  resetPassword: {
    points: 3,
    duration: 3600,
    blockDuration: 1800,

    windowSec: 3600,
    max: 3,
    blockDurationSec: 1800,
  },

  postCreate: {
    points: 10,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 15,
    blockDurationSec: 120,
  },

 commentUpdate: {
    points: 10,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 20,
    blockDurationSec: 120,
},

 commentDelete: {
    points: 10,
    duration: 60,
    blockDuration: 120,
    
    windowSec: 60,
    max: 20,
    blockDurationSec: 120,
},


  updateAvatar: {
    points: 5,
    duration: 60,
    blockDuration: 120, 

    windowSec: 300,     
    max: 3,             
    blockDurationSec: 600, 
  },

  updateCover: {
    points: 5,
    duration: 60,
    blockDuration: 120,

    windowSec: 300,
    max: 3,
    blockDurationSec: 600,
  },

  commentCreate: {
    points: 20,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 30,
    blockDurationSec: 120,
  },

  followUser: {
    points: 50,
    duration: 3600,
    blockDuration: 3600,

    windowSec: 3600,
    max: 50,
    blockDurationSec: 3600,
  },

  unfollowUser: {
    points: 50,
    duration: 3600,
    blockDuration: 3600,

    windowSec: 3600,
    max: 50,
    blockDurationSec: 3600,
  },

  messagingSend: {
    points: 60,
    duration: 60,
    blockDuration: 300,

    windowSec: 60,
    max: 60,
    blockDurationSec: 300,
  },

  oauth: {
    points: 20,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 20,
    blockDurationSec: 120,
  },

    logout: {
    /**
     * Logout rate-limit
     * ป้องกัน spam logout เพื่อป้องกัน load ฝั่ง backend
     */
    points: 20,
    duration: 60,
    blockDuration: 60,

    // new format
    windowSec: 60,        // window 1 minute
    max: 20,              // allow max 20 per minute
    blockDurationSec: 60, // block 1 minute
  },

};
