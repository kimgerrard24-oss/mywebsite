// frontend/src/types/post-visibility.ts

export type PostVisibility =
  | 'PUBLIC'
  | 'FOLLOWERS'
  | 'PRIVATE'
  | 'CUSTOM';

export type PostVisibilityValue = {
  visibility: PostVisibility;
  includeUserIds?: string[];
  excludeUserIds?: string[];
};

export type UpdatePostVisibilityPayload = PostVisibilityValue;


/**
 * Backend authority decision
 * Used by:
 * - POST /posts/visibility/validate
 * - visibility guard components
 */
export type PostVisibilityDecision = {
  canView: boolean;

  /**
   * reason is for UX + analytics only
   * backend is still authority
   */
  reason:
    // ===== success =====
    | 'OWNER'
    | 'PUBLIC'
    | 'FOLLOWER'
    | 'CUSTOM_ALLOWED'

    // ===== denied =====
    | 'NOT_FOUND'
    | 'POST_DELETED'
    | 'POST_HIDDEN'
    | 'BLOCKED'
    | 'PRIVATE_ACCOUNT'
    | 'NOT_FOLLOWER'
    | 'PRIVATE_POST'
    | 'NOT_IN_CUSTOM_LIST'
    | 'EXCLUDED'
    | 'CUSTOM_DENIED'
    | 'VISIBILITY_DENIED';
};

