// frontend/src/types/post-visibility.ts

export type PostVisibilityDecision = {
  canView: boolean;
  reason:
    | 'OK'
    | 'NOT_FOUND'
    | 'POST_DELETED'
    | 'POST_HIDDEN'
    | 'BLOCKED'
    | 'PRIVATE_ACCOUNT'
    | 'NOT_FOLLOWER'
    | 'NOT_OWNER';
};
