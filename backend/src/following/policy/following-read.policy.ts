// backend/src/following/policy/following-read.policy.ts
export class FollowingReadPolicy {
  static assertCanReadFollowing(_: { 
    userId: string; 
    viewerUserId: string | null; 
  }) {
    // hook สำหรับ privacy / block / visibility
    // ปัจจุบัน allow-all (production-ready)
  }
}
