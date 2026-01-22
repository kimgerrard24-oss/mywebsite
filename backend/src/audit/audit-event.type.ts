// backend/src/audit/audit-event.type.ts

export type AuditEventType =
  | 'moderation.post.override_visibility'
  | 'auth.login'
  | 'auth.logout'
  | 'post.create'
  | 'post.delete';
