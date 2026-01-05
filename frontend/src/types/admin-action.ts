// frontend/src/types/admin-action.ts

/**
 * AdminAction
 *
 * - Backward compatible with legacy admin actions
 * - Forward compatible with new audit-based admin actions
 * - Used by:
 *   - GET /admin/actions
 *   - GET /admin/actions/:id
 */

export type AdminAction = {
  /**
   * Core
   */
  id: string;
  targetId: string;
  createdAt: string;

  /**
   * Action semantics
   * - legacy: BAN | HIDE | FLAG
   * - new: BAN_USER | UNBAN_USER | DELETE_POST | DELETE_COMMENT | etc.
   */
  actionType:
    | 'BAN'
    | 'HIDE'
    | 'FLAG'
    | string;

  targetType:
    | 'USER'
    | 'POST'
    | 'COMMENT'
    | string;

  /**
   * Reason / metadata
   */
  reason?: string | null;
  metadata?: Record<string, any> | null;

  /**
   * Legacy admin field (DO NOT REMOVE)
   * - used by old UI / logic
   */
  admin?: {
    id: string;
    username: string;
    displayName: string | null;
  };

  /**
   * New unified actor field (preferred)
   * - returned by new admin audit APIs
   */
  actor?: {
    id: string;
    username: string;
    displayName: string | null;
    role: 'ADMIN' | 'USER';
  };
};
