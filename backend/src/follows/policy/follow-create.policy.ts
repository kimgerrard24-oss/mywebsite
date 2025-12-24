// backend/src/follows/policy/follow-create.policy.ts
export class FollowCreatePolicy {
  static assertCanFollow(params: {
    followerId: string;
    followingId: string;
  }) {
    const { followerId, followingId } = params;

    if (followerId === followingId) {
      throw new Error('CANNOT_FOLLOW_SELF');
    }
  }
}
