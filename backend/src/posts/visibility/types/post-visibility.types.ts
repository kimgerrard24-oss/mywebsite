// backend/src/posts/visibility/types/post-visibility.types.ts

export type PostVisibilityDecision = {
  canView: boolean;
  reason:
    | 'OK'
    | 'OWNER'
    | 'NOT_FOUND'
    | 'POST_DELETED'
    | 'POST_HIDDEN'
    | 'BLOCKED'
    | 'PRIVATE_ACCOUNT'
    | 'NOT_FOLLOWER'
    | 'PRIVATE_POST'
    | 'EXCLUDED'
    | 'NOT_IN_CUSTOM_LIST'
    | 'VISIBILITY_DENIED';
};

