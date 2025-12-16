// backend/src/users/policies/user-search.policy.ts
export class UserSearchPolicy {
  static canView(params: {
    target: { isDisabled: boolean };
    viewerUserId: string;
  }): boolean {
    const { target } = params;

    // user ถูก disable = ไม่แสดง
    if (target.isDisabled) {
      return false;
    }

    return true;
  }
}
