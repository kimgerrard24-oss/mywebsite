/**
 * รายการ action สำหรับ RateLimitGuard และ RateLimitService
 */
export type RateLimitAction =
  | 'login'
  | 'register'
  | 'resetPassword'
  | 'postCreate'
  | 'commentCreate'
  | 'commentReplyCreate'
  | 'commentLike' 
  | 'followUser'
  | 'updateAvatar'
  | 'updateCover'
  | 'unfollowUser'
  | 'commentUpdate'   
  | 'commentDelete'
  | 'messagingSend'
  | 'oauth'
  | 'logout'
  | 'adminUsersList'
  | 'adminUserBan'
  | 'adminDeleteComment'
  | 'adminPostDelete'
  | 'reportCreate'
  | 'reportRead'
  | 'reportReadDetail'
  | 'reportWithdraw'
  | 'mentionSearch'
  | 'verifyCredential'
  | 'usernameCheck'
  | 'phoneChangeRequest'
  | 'phoneChangeConfirm'
  | 'updateUsername'
  | 'emailChangeRequest'
  | 'emailChangeConfirm'
  | 'resendEmailVerify'
  | 'profileExport'
  | 'emailVerify';

export type RateLimitEscalationConfig = {
  maxViolations: number;
  windowSec: number;     // seconds
  longBlockSec: number;  // seconds
};

export type RateLimitConfig = {
  // old structure (still used in service)
  points: number;
  duration: number;
  blockDuration?: number;

  // new structure for clarity
  windowSec: number;
  max: number;
  blockDurationSec: number;

  escalation?: RateLimitEscalationConfig;
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
    blockDurationSec: 60, // block for 1 minute

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 21600,  // block 6 ชม.
     },
  },

  register: {
    points: 6,
    duration: 60,
    blockDuration: 600,

    windowSec: 60,
    max: 6,
    blockDurationSec: 600,

  escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 21600,  // block 6 ชม.
     },
  },

  resetPassword: {
    points: 3,
    duration: 3600,
    blockDuration: 1800,

    windowSec: 3600,
    max: 3,
    blockDurationSec: 1800,

    escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 21600,  // block 6 ชม.
     },
  },

 postCreate: {
  points: 10,
  duration: 60,
  blockDuration: 120,

  windowSec: 60,
  max: 15,
  blockDurationSec: 120,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
    longBlockSec: 86400,  // block 24 ชม.
  },
},

 commentUpdate: {
    points: 10,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 20,
    blockDurationSec: 120,

    escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     },
},
 
commentReplyCreate: {
  points: 20,
  duration: 60,
  blockDuration: 120,

  windowSec: 60,
  max: 20,                
  blockDurationSec: 120,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // 24 ชม.
    longBlockSec: 86400,  // block 24 ชม.
  },
},

 commentDelete: {
    points: 10,
    duration: 60,
    blockDuration: 120,
    
    windowSec: 60,
    max: 20,
    blockDurationSec: 120,

  escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     },
},

commentLike: {
  /**
   * Like / Unlike comment
   * ป้องกัน spam toggle
   */
  points: 30,
  duration: 60,
  blockDuration: 120,

  // new structure
  windowSec: 60,
  max: 60,                 // allow 60 toggles / minute
  blockDurationSec: 120,   // block 2 minutes

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // 24 ชม.
    longBlockSec: 86400,  // block 24 ชม.
  },
},

  updateAvatar: {
    points: 5,
    duration: 60,
    blockDuration: 120, 

    windowSec: 300,     
    max: 3,             
    blockDurationSec: 600, 

  escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     },  
  },

  updateCover: {
    points: 5,
    duration: 60,
    blockDuration: 120,

    windowSec: 300,
    max: 3,
    blockDurationSec: 600,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     }, 
  },

  commentCreate: {
    points: 20,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 30,
    blockDurationSec: 120,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     }, 
  },

  followUser: {
    points: 100,
    duration: 3600,
    blockDuration: 3600,

    windowSec: 3600,
    max: 50,
    blockDurationSec: 3600,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     }, 
  },

  unfollowUser: {
    points: 50,
    duration: 3600,
    blockDuration: 3600,

    windowSec: 3600,
    max: 50,
    blockDurationSec: 3600,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     }, 
  },

  messagingSend: {
    points: 60,
    duration: 60,
    blockDuration: 300,

    windowSec: 60,
    max: 60,
    blockDurationSec: 300,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     }, 
  },

  oauth: {
    points: 10,
    duration: 60,
    blockDuration: 120,

    windowSec: 60,
    max: 20,
    blockDurationSec: 120,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     }, 
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

  adminUsersList: {
  /**
   * Admin: List users
   * ป้องกัน abuse / scraping / admin mistake
   */
  points: 20,
  duration: 60,
  blockDuration: 300,

  // new structure
  windowSec: 60,        // 1 minute
  max: 10,              // allow 10 requests / minute
  blockDurationSec: 300, // block 5 minutes

  escalation: {
    maxViolations: 3,
    windowSec: 86400,    // 24 ชม.
    longBlockSec: 21600, // block 6 ชม.
  },
 },

  adminUserBan: {
  windowSec: 60,
  max: 50,
  blockDurationSec: 600,

  points: 50,
  duration: 60,
  blockDuration: 600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
 },

 adminPostDelete: {
  points: 50,
  duration: 60,
  blockDuration: 600,

  windowSec: 60,
  max: 50,
  blockDurationSec: 600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
 },

  adminDeleteComment: {
  points: 50,
  duration: 60,
  blockDuration: 300,

  windowSec: 60,
  max: 10,
  blockDurationSec: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
 },

  reportCreate: {
  /**
   * User report content
   * ป้องกัน spam / harassment reporting
   */
  points: 10,
  duration: 60,
  blockDuration: 300,

  windowSec: 60,
  max: 10,                // รายงานได้สูงสุด 5 ครั้ง / นาที
  blockDurationSec: 300, // block 5 นาที

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
 },

 reportRead: {
  points: 20,
  duration: 60,

  windowSec: 60,
  max: 20,
  blockDurationSec: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

 reportReadDetail: {
  /**
   * Read own report detail
   * Prevent ID enumeration / abuse
   */
  points: 20,
  duration: 60,

  windowSec: 60,
  max: 20,
  blockDurationSec: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

reportWithdraw: {
  /**
   * Withdraw report
   * Prevent abuse / spam
   */
  points: 5,
  duration: 60,

  windowSec: 60,
  max: 5,
  blockDurationSec: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

mentionSearch: {
  /**
   * Mention autocomplete
   * - high frequency (typing)
   * - must protect against scraping
   */
  points: 120,
  duration: 60,
  blockDuration: 300,

  windowSec: 60,
  max: 120,               // allow 120 searches / minute
  blockDurationSec: 300,  // block 5 minutes

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // within 24h
    longBlockSec: 21600,  // block 6 hours
  },
},

verifyCredential: {
  /**
   * Verify password before sensitive actions
   * Protect against brute-force on password
   */
  points: 5,
  duration: 600,        // 10 minutes
  blockDuration: 900,   // 15 minutes

  windowSec: 600,       // 10 นาที
  max: 5,               // ได้ 5 ครั้ง
  blockDurationSec: 900, // block 15 นาที

  escalation: {
    maxViolations: 3,   // ถ้าโดน block 3 รอบ
    windowSec: 86400,   // ภายใน 24 ชม.
    longBlockSec: 21600, // block 6 ชม.
  },
 },

 usernameCheck: {
  points: 120,
  duration: 60,
  blockDuration: 300,

  windowSec: 60,
  max: 120,              // typing autocomplete
  blockDurationSec: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6h
  },
 },

 updateUsername: {
  points: 5,
  duration: 300,
  blockDuration: 600,

  windowSec: 300,
  max: 3,
  blockDurationSec: 600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

phoneChangeRequest: {
  windowSec: 600,        // 10 นาที
  max: 3,                // ขอได้ 3 ครั้ง
  blockDurationSec: 1800, // block 30 นาที

  points: 3,
  duration: 600,
  blockDuration: 1800,

  escalation: {
    maxViolations: 3,     // ถ้าโดน block 3 รอบ
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
},

phoneChangeConfirm: {
  windowSec: 300,        // 5 นาที
  max: 5,                // เดาได้ 5 ครั้ง
  blockDurationSec: 900, // block 15 นาที

  points: 5,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

emailVerify: {
  windowSec: 300,        // 5 นาที
  max: 10,               // เดา token ได้ 10 ครั้ง
  blockDurationSec: 1800, // block 30 นาที

  points: 10,
  duration: 300,
  blockDuration: 1800,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // block 6 ชม.
  },
},


emailChangeRequest: {
  windowSec: 900,        // 15 นาที
  max: 3,                // ขอได้ 3 ครั้ง
  blockDurationSec: 3600, // block 1 ชม.

  points: 3,
  duration: 900,
  blockDuration: 3600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6 ชม.
  },
},

emailChangeConfirm: {
  windowSec: 300,        // 5 นาที
  max: 5,                // เดา token ได้ 5 ครั้ง
  blockDurationSec: 900, // block 15 นาที

  points: 5,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

resendEmailVerify: {
  windowSec: 600,         // 10 นาที
  max: 3,
  blockDurationSec: 1800,

  points: 3,
  duration: 600,
  blockDuration: 1800,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

profileExport: {
  /**
   * GDPR / Data export
   * Sensitive but low frequency
   */
  windowSec: 3600,        // 1 ชม.
  max: 3,                // export ได้ 3 ครั้ง / ชม.
  blockDurationSec: 7200, // block 2 ชม.

  points: 3,
  duration: 3600,
  blockDuration: 7200,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
},

};


