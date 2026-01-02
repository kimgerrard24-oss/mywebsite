// frontend/src/types/admin-user.ts

/**
 * ==============================
 * Admin User Types
 * ==============================
 *
 * ⚠️ IMPORTANT
 * - Backend is the authority
 * - Frontend must NOT infer permission or policy
 * - This type reflects the API contract from:
 *   GET /admin/users
 */

/**
 * User role returned by backend
 * (extendable in the future, e.g. "MODERATOR")
 */
export type AdminUserRole = "USER" | "ADMIN";

/**
 * Optional user profile information
 */
export type AdminUserProfile = {
  displayName: string | null;
  avatarUrl: string | null;
};

/**
 * AdminUser
 *
 * Represents a single user item in admin context.
 * Used by:
 * - AdminUserList
 * - AdminUserRow
 * - Ban / Unban UI
 */
export type AdminUser = {
  /**
   * Unique user identifier
   */
  id: string;

  /**
   * Primary email address
   */
  email: string;

  /**
   * Role assigned by backend
   * (backend authority)
   */
  role: AdminUserRole;

  /**
   * Account active state (source of truth)
   * - true  => active
   * - false => banned / disabled
   */
  isActive: boolean;

  /**
   * ISO 8601 timestamp string
   */
  createdAt: string;

  /**
   * Optional profile data
   */
  profile: AdminUserProfile | null;
};

/**
 * Paginated response for admin users list
 *
 * Returned by:
 * GET /admin/users
 */
export type AdminUsersResponse = {
  /**
   * User items for current page
   */
  items: AdminUser[];

  /**
   * Current page number (1-based)
   */
  page: number;

  /**
   * Items per page
   */
  limit: number;

  /**
   * Total number of users
   */
  total: number;
};
