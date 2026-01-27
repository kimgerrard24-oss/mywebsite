// backend/src/users/dto/public-user-search.dto.ts

export type TagBlockReason =
  | 'FOLLOWERS_ONLY'
  | 'FOLLOWING_ONLY'
  | 'TAG_DISABLED'
  | 'BLOCKED';

export class PublicUserSearchDto {
  id!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;

  /**
   * 🔥 Tag UX hints (optional, backward compatible)
   */
  canBeTagged?: boolean;
  tagBlockReason?: TagBlockReason;

  /**
   * Default mapper (safe for all callers)
   * - Works for normal search
   * - Works for tag search if extra fields exist
   */
  static fromEntity(entity: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;

    // ===== optional tag context =====
    canBeTagged?: boolean;
    tagBlockReason?: TagBlockReason;
  }): PublicUserSearchDto {
    const dto: PublicUserSearchDto = {
      id: entity.id,
      username: entity.username,
      displayName: entity.displayName,
      avatarUrl: normalizeAvatarUrl(entity.avatarUrl),
    };

    // only attach when provided (do not break old clients)
    if (typeof entity.canBeTagged === 'boolean') {
      dto.canBeTagged = entity.canBeTagged;
    }

    if (entity.tagBlockReason) {
      dto.tagBlockReason = entity.tagBlockReason;
    }

    return dto;
  }
}

/**
 * Normalize avatar URL to public CDN domain
 * - Fail-soft (never throw)
 * - Never leaks internal R2 endpoint
 */
function normalizeAvatarUrl(url: string | null): string | null {
  if (!url) return null;

  const publicBase = process.env.R2_PUBLIC_BASE_URL;
  if (!publicBase) return url;

  try {
    const parsed = new URL(url);

    // R2 dev domain → CDN
    if (parsed.hostname.endsWith('.r2.dev')) {
      return `${publicBase}${parsed.pathname}`;
    }

    // already public
    return url;
  } catch {
    // malformed URL → fail-soft
    return url;
  }
}
