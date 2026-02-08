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
  | 'chatMessageEdit'
  | 'chatTyping'
  | 'oauth'
  | 'shareResolve'
  | 'logout'
  | 'adminUsersList'
  | 'adminUserBan'
  | 'adminUpdateIdentity'
  | 'adminDeleteComment'
  | 'adminPostDelete'
  | 'reportFollowRequest'
  | 'reportCreate'
  | 'reportRead'
  | 'reportReadDetail'
  | 'reportWithdraw'
  | 'userBlock'
  | 'userUnblock'
  | 'mentionSearch'
  | 'verifyCredential'
  | 'usernameCheck'
  | 'phoneChangeRequest'
  | 'followRequestCreate'
  | 'followRequestCancel'
  | 'followRequestApprove'
  | 'followRequestReject'
  | 'phoneChangeConfirm'
  | 'updateUsername'
  | 'emailChangeRequest'
  | 'emailChangeConfirm'
  | 'resendEmailVerify'
  | 'profileExport'
  | 'postLike'
  | 'userModerationRead'
  | 'mediaComplete'
  | 'mediaPresign'
  | 'mediaGallery'
  | 'postTagHide'
  | 'postTagUnhide'
  | 'userHiddenTaggedPostsRead'
  | 'postsVisibilityValidate'
  | 'postUpdate'
  | 'publicPostRead'
  | 'postDelete'
  | 'publicPostShareRead'
  | 'postUpdateTags'
  | 'postTagDecision'
  | 'postUpdateVisibility'
  | 'repostCreate'
  | 'repostDelete'
  | 'repostList'
  | 'updateProfile'
  | 'getTagSettings'
  | 'notificationRead'
  | 'requestSetPassword'
  | 'confirmSetPassword'
  | 'requestPasswordReset'  
  | 'confirmPasswordReset'
  | 'emailVerify'
  | 'messagingSend'
  | 'chatRoomsDisplay'
  | 'shareIntent'
  | 'shareCreate'
  | 'shareExternal'
  | 'accountLock'
  | 'adminDisableShare'
  | 'postShareStatsRead'
  | 'updatePrivacy';

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
    points: 7,
    duration: 60,
    blockDuration: 300,

    // new format (explicit)
    windowSec: 60,       // window
    max: 7,              // allow 5 attempts
    blockDurationSec: 60, // block for 1 minute

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 21600,  // block 6 ชม.
     },
  },

  register: {
    points: 7,
    duration: 60,
    blockDuration: 600,

    windowSec: 60,
    max: 7,
    blockDurationSec: 600,

  escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 21600,  // block 6 ชม.
     },
  },

  resetPassword: {
    points: 6,
    duration: 3600,
    blockDuration: 1800,

    windowSec: 3600,
    max: 6,
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
  max: 10,
  blockDurationSec: 120,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
},

 commentUpdate: {
    points: 15,
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
 
commentReplyCreate: {
  points: 15,
  duration: 60,
  blockDuration: 120,

  windowSec: 60,
  max: 15,                
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
  max: 30,                 // allow 60 toggles / minute
  blockDurationSec: 120,   // block 2 minutes

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // 24 ชม.
    longBlockSec: 86400,  // block 24 ชม.
  },
},

  updateAvatar: {
    points: 15,
    duration: 120,
    blockDuration: 360, 

    windowSec: 120,     
    max: 15,             
    blockDurationSec: 360, 

  escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 86400,  // block 24 ชม.
     },  
  },

  updateCover: {
    points: 15,
    duration: 120,
    blockDuration: 120,

    windowSec: 120,
    max: 15,
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
      longBlockSec: 7200,  
     }, 
  },

  followUser: {
    points: 120,
    duration: 60,
    blockDuration: 300,

    windowSec: 60,
    max: 120,
    blockDurationSec: 300,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 7200,  
     }, 
  },

  unfollowUser: {
    points: 120,
    duration: 120,
    blockDuration: 300,

    windowSec: 120,
    max: 120,
    blockDurationSec: 300,

   escalation: {
      maxViolations: 3,
      windowSec: 86400,     // ทำผิดครบ 3 ครั้งภายใน 24 ชม.
      longBlockSec: 7200,  
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
    blockDuration: 120,

    // new format
    windowSec: 60,        // window 1 minute
    max: 20,              // allow max 20 per minute
    blockDurationSec: 120, 
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
  points: 100,
  duration: 60,
  blockDuration: 300,

  windowSec: 60,
  max: 100,               // allow 120 searches / minute
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

requestSetPassword: {
  /**
   * Request password setup email (social → local)
   * Prevent email abuse / enumeration
   */
  windowSec: 900,          // 15 minutes
  max: 5,                  // allow 3 requests
  blockDurationSec: 3600,  // block 1 hour

  // legacy fields (still required by service)
  points: 5,
  duration: 900,
  blockDuration: 3600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,      // 24h
    longBlockSec: 21600,   // block 6h
  },
},

confirmSetPassword: {
  windowSec: 300,        // 5 นาที
  max: 5,                // เดา token ได้ 5 ครั้ง
  blockDurationSec: 900, // block 15 นาที

  points: 5,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6 ชม.
  },
},

requestPasswordReset: {
  windowSec: 900,
  max: 3,
  blockDurationSec: 3600,

  points: 3,
  duration: 900,
  blockDuration: 3600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

confirmPasswordReset: {
  windowSec: 300,
  max: 5,
  blockDurationSec: 900,

  points: 5,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

updatePrivacy: {
  windowSec: 300,        // 5 นาที
  max: 15,                // เปลี่ยนได้ 5 ครั้ง
  blockDurationSec: 900, // block 15 นาที

  // legacy fields (ยังใช้ใน service)
  points: 15,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
},

postLike: {
  windowSec: 60,
  max: 60,
  blockDurationSec: 120,

  points: 60,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 86400,
  },
},

postUpdate: {
  windowSec: 60,
  max: 20,
  blockDurationSec: 120,

  points: 20,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 86400,
  },
},

postDelete: {
  windowSec: 60,
  max: 15,
  blockDurationSec: 300,

  points: 15,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

postUpdateVisibility: {
  windowSec: 300,
  max: 5,
  blockDurationSec: 900,

  points: 5,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

postUpdateTags: {
  windowSec: 60,
  max: 20,
  blockDurationSec: 300,

  points: 20,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

postTagDecision: {
  windowSec: 60,
  max: 30,
  blockDurationSec: 300,

  points: 30,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

updateProfile: {
  windowSec: 300,
  max: 10,
  blockDurationSec: 900,

  points: 10,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

chatTyping: {
  windowSec: 10,         // window สั้น
  max: 30,               // 30 ครั้ง / 10 วิ (≈ 3 ครั้งต่อวิ)
  blockDurationSec: 60,  // block 1 นาทีถ้าเกิน

  // legacy (ยังใช้ใน service)
  points: 30,
  duration: 10,
  blockDuration: 60,

  escalation: {
    maxViolations: 5,    // ต้อง abuse ต่อเนื่องจริง ๆ
    windowSec: 86400,    // ภายใน 24 ชม.
    longBlockSec: 3600,  // block 1 ชม.
  },
},

chatMessageEdit: {
  windowSec: 60,
  max: 20,
  blockDurationSec: 120,

  points: 20,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 86400,
  },
},

followRequestCreate: {
  windowSec: 3600,        // 1 ชั่วโมง
  max: 30,                // ขอ follow request ได้ 30 คน / ชม.
  blockDurationSec: 3600, // block 1 ชม.

  points: 30,
  duration: 3600,
  blockDuration: 3600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 86400,  // block 24 ชม.
  },
},

followRequestCancel: {
  windowSec: 3600,
  max: 50,
  blockDurationSec: 1800,

  points: 50,
  duration: 3600,
  blockDuration: 1800,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6 ชม.
  },
},

followRequestApprove: {
  windowSec: 3600,
  max: 50,
  blockDurationSec: 1800,

  points: 50,
  duration: 3600,
  blockDuration: 1800,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

followRequestReject: {
  windowSec: 3600,
  max: 50,
  blockDurationSec: 1800,

  points: 50,
  duration: 3600,
  blockDuration: 1800,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

notificationRead: {
  windowSec: 60,
  max: 100,              // mark many as read when scrolling
  blockDurationSec: 300,

  points: 100,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6 ชม.
  },
},

accountLock: {
  // low frequency, very sensitive
  windowSec: 3600,        // 1 ชั่วโมง
  max: 3,                 // กดได้แค่ 2 ครั้ง / ชม
  blockDurationSec: 86400, // block 24 ชม

  // legacy
  points: 3,
  duration: 3600,
  blockDuration: 86400,

  escalation: {
    maxViolations: 2,     // ถ้าโดน block 2 ครั้ง
    windowSec: 86400,     // ภายใน 24 ชม
    longBlockSec: 604800, // block 7 วัน
  },
},

mediaPresign: {
  windowSec: 60,
  max: 10,                // ขอได้ 10 ครั้ง/นาที
  blockDurationSec: 300, // block 5 นาที

  points: 10,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6 ชม.
  },
},

mediaComplete: {
  windowSec: 60,
  max: 15,
  blockDurationSec: 300,

  points: 15,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

userModerationRead: {
  windowSec: 60,
  max: 30,                // เปิดดูได้ 30 ครั้ง/นาที
  blockDurationSec: 300, // block 5 นาที

  points: 30,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // block 6 ชม.
  },
},

adminUpdateIdentity: {
  /**
   * Admin: update user identity
   * Extremely sensitive action
   */
  windowSec: 60,
  max: 5,                 // ได้ไม่เกิน 5 ครั้ง/นาที
  blockDurationSec: 600,  // block 10 นาที

  points: 5,
  duration: 60,
  blockDuration: 600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
},

reportFollowRequest: {
  windowSec: 60,
  max: 10,
  blockDurationSec: 300,

  points: 10,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

userBlock: {
  windowSec: 300,        // 5 นาที
  max: 15,               // block ได้ไม่เกิน 10 คน
  blockDurationSec: 900, // block 15 นาที

  points: 15,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600, // 6 ชม.
  },
},

userUnblock: {
  windowSec: 300,
  max: 15,
  blockDurationSec: 900,

  points: 15,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

getTagSettings: {
  windowSec: 60,       
  max: 20,                
  blockDurationSec: 900, 

  // legacy fields (ยังใช้ใน service)
  points: 20,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม.
  },
},

postsVisibilityValidate: {
  // soft protection (UI calls often)
  windowSec: 60,        // 1 minute window
  max: 60,              // allow 60 checks / minute
  blockDurationSec: 120, // block 2 minutes if abused

  // legacy fields (still used)
  points: 60,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 5,     // ต้อง spam ต่อเนื่องจริง ๆ
    windowSec: 86400,     // within 24h
    longBlockSec: 3600,   // block 1 hour
  },
},

shareIntent: {
  windowSec: 60,
  max: 60,                // UI อาจกดหลายครั้ง
  blockDurationSec: 120,  // block 2 นาทีถ้า spam

  // legacy
  points: 60,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 5,
    windowSec: 86400,
    longBlockSec: 3600,   // block 1 ชม. ถ้า abuse ต่อเนื่อง
  },
},

shareCreate: {
  windowSec: 60,
  max: 20,                // ส่งแชร์ได้ 20 ครั้ง/นาที
  blockDurationSec: 300,  // block 5 นาที

  // legacy
  points: 20,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,  // block 6 ชม.
  },
},

shareExternal: {
  windowSec: 300,         // 5 นาที
  max: 5,                 // สร้างได้ 5 ลิงก์ / 5 นาที
  blockDurationSec: 900,  // block 15 นาที

  // legacy
  points: 5,
  duration: 300,
  blockDuration: 900,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 86400,  // block 24 ชม. ถ้า abuse
  },
},

postShareStatsRead: {
  windowSec: 60,
  max: 600,                // เปิดดูได้ 60 ครั้ง/นาที
  blockDurationSec: 120,  // block 2 นาทีถ้า spam

  // legacy (ยังใช้ใน service)
  points: 600,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 5,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 3600,   // block 1 ชม. ถ้า abuse ต่อเนื่อง
  },
},

adminDisableShare: {
  windowSec: 60,
  max: 10,                // admin ทำได้ไม่เกิน 10 ครั้ง/นาที
  blockDurationSec: 600,  // block 10 นาทีถ้าเกิน

  // legacy (ยังใช้ใน service)
  points: 10,
  duration: 60,
  blockDuration: 600,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 21600,  // block 6 ชม. ถ้า abuse ซ้ำ
  },
},

shareResolve: {
  // ===== readable form =====
  windowSec: 60,          // 1 นาที
  max: 120,               // 120 req / min / IP
  blockDurationSec: 300,  // block 5 นาที

  // ===== legacy fields =====
  points: 120,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 10,    // ต้อง abuse ต่อเนื่องจริง
    windowSec: 86400,     // 24 ชม.
    longBlockSec: 3600,   // block 1 ชม.
  },
},

publicPostRead: {
  // ===== main =====
  windowSec: 60,           // 1 นาที
  max: 300,                // 300 req / min / IP
  blockDurationSec: 300,   // block 5 นาที

  // ===== legacy =====
  points: 300,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 10,     // ต้อง abuse ต่อเนื่องจริง
    windowSec: 86400,      // 24 ชม.
    longBlockSec: 3600,    // block 1 ชม.
  },
},

publicPostShareRead: {
  // ===== main =====
  windowSec: 60,            // 1 นาที
  max: 2000,                 // รองรับ crawler + social bot
  blockDurationSec: 120,    // block 5 นาทีถ้า abuse

  // ===== legacy =====
  points: 600,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 20,      // ต้อง spam หนักจริง
    windowSec: 86400,       // 24 ชม.
    longBlockSec: 3600,     // block 1 ชม.
  },
},

postTagHide: {
  windowSec: 60,
  max: 30,                 // hide ได้ 30 ครั้ง / นาที
  blockDurationSec: 300,   // block 5 นาทีถ้า spam

  points: 30,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,      // 24 ชม.
    longBlockSec: 21600,   // block 6 ชม.
  },
},

postTagUnhide: {
  windowSec: 60,
  max: 30,
  blockDurationSec: 300,

  points: 30,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,
  },
},

userHiddenTaggedPostsRead: {
  windowSec: 60,
  max: 30,                 // scroll / reload ได้สบาย
  blockDurationSec: 300,

  points: 30,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 5,      // ต้อง abuse ต่อเนื่อง
    windowSec: 86400,
    longBlockSec: 3600,    // block 1 ชม.
  },
},

repostCreate: {
  windowSec: 60,
  max: 10,                 // repost ได้ 10 ครั้ง / นาที
  blockDurationSec: 300,   // block 5 นาที

  // legacy (ยังต้องมี)
  points: 10,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,      // 24 ชม.
    longBlockSec: 86400,   // block 24 ชม.
  },
},

repostDelete: {
  windowSec: 60,
  max: 15,                // undo repost ได้ถี่กว่า
  blockDurationSec: 300,

  points: 15,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 3,
    windowSec: 86400,
    longBlockSec: 21600,   // block 6 ชม.
  },
},

repostList: {
  windowSec: 60,
  max: 120,               // scroll ได้สบาย
  blockDurationSec: 300,  // block 5 นาทีถ้า spam

  points: 120,
  duration: 60,
  blockDuration: 300,

  escalation: {
    maxViolations: 5,     // ต้อง abuse ต่อเนื่องจริง
    windowSec: 86400,
    longBlockSec: 3600,   // block 1 ชม.
  },
},

chatRoomsDisplay: {
  /**
   * Chat room list (share modal / picker)
   * - read-only
   * - UI triggered
   * - must not break UX
   */
  windowSec: 60,          // 1 minute window
  max: 60,                // ~1 req/sec per user
  blockDurationSec: 120,  // block 2 minutes if abused

  // legacy fields (still required)
  points: 60,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 3,     // ต้อง abuse ต่อเนื่องจริง
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 3600,   // block 1 ชม.
  },
},

mediaGallery: {
  /**
   * Owner media gallery
   * - Read-only
   * - Infinite scroll
   * - SSR + CSR
   */
  windowSec: 60,          // 1 minute
  max: 60,                // ~1 req/sec per user
  blockDurationSec: 120,  // block 2 minutes if abused

  // legacy (ยังต้องมี)
  points: 60,
  duration: 60,
  blockDuration: 120,

  escalation: {
    maxViolations: 5,     // ต้อง spam ต่อเนื่องจริง
    windowSec: 86400,     // ภายใน 24 ชม.
    longBlockSec: 3600,   // block 1 ชม.
  },
},

};


