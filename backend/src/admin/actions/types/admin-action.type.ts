// backend/src/admin/actions/types/admin-action.type.ts

export type AdminActionType =
  | 'BAN_USER'
  | 'UNBAN_USER'
  | 'DELETE_POST'
  | 'DELETE_COMMENT';

export type AdminTargetType =
  | 'USER'
  | 'POST'
  | 'COMMENT';
