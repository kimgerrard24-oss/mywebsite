// backend/src/users/policies/user-search.policy.ts

export class UserSearchPolicy {
  static canView(params: {
    target: {
      isDisabled: boolean;

      /**
       * optional defensive flags (from repo join)
       */
      isBlockedByViewer?: boolean;
      hasBlockedViewer?: boolean;
    };
    viewerUserId: string;
  }): boolean {
    const { target } = params;

    // 1) disabled user
    if (target.isDisabled) {
      return false;
    }

    // 2) block relations (defense-in-depth only)
    if (target.isBlockedByViewer === true) {
      return false;
    }

    if (target.hasBlockedViewer === true) {
      return false;
    }

    return true;
  }
}
