// src/common/rate-limit/rate-limit.policy.ts

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

export const RateLimitPolicy: Record<
  RateLimitAction,
  { points: number; duration: number }
> = {
  // Global / IP-level rate limit
  ip: { points: 100, duration: 60 },

  // Auth-related actions
  login: { points: 5, duration: 60 },
  register: { points: 3, duration: 3600 },
  resetPassword: { points: 3, duration: 3600 },

  // Posting actions
  postCreate: { points: 10, duration: 60 },
  commentCreate: { points: 15, duration: 60 },

  // Social graph actions
  followUser: { points: 20, duration: 3600 },
  unfollowUser: { points: 20, duration: 3600 },

  
  messagingSend: { points: 30, duration: 60 },
};
