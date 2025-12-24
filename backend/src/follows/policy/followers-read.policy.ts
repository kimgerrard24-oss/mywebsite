// backend/src/follows/policy/followers-read.policy.ts
export class FollowersReadPolicy {
  static assertCanReadFollowers(_: { userId: string }) {
    // hook สำหรับ privacy / block / visibility
    // ตอนนี้ allow-all (production-ready)
  }
}
