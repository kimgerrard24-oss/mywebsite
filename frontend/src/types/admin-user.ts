// frontend/src/types/admin-user.ts

/**
 * ==============================
 * Admin User Types
 * ==============================
 *
 * IMPORTANT
 * - Backend is the authority
 * - Frontend must NOT infer permission or policy
 * - This type reflects the API contract from:
 *   GET /admin/users
 */

/**
 * User role returned by backend
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
   * 🔒 Ban authority (source of truth)
   * - true  => banned
   * - false => not banned
   */
  isBanned: boolean;

  /**
   * Legacy / implementation detail
   * Should NOT be used to determine ban state
   */
  isActive: boolean;

  /**
   * Legacy / implementation detail
   * Should NOT be used to determine ban state
   */
  isDisabled: boolean;

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
 */
export type AdminUsersResponse = {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
};

export type AdminUserDetail = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  isDisabled: boolean;
  createdAt: string;

  stats: {
    postCount: number;
    commentCount: number;
  };
};
