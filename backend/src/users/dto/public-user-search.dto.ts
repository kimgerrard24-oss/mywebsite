// backend/src/users/dto/public-user-search.dto.ts

export class PublicUserSearchDto {
  id!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;

  static fromEntity(entity: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }): PublicUserSearchDto {
    return {
      id: entity.id,
      username: entity.username,
      displayName: entity.displayName,
      avatarUrl: normalizeAvatarUrl(entity.avatarUrl),
    };
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

    // ถ้าเป็น R2 dev domain → แปลงเป็น CDN
    if (parsed.hostname.endsWith('.r2.dev')) {
      return `${publicBase}${parsed.pathname}`;
    }

    // ถ้าเป็น CDN อยู่แล้ว → ใช้ตรง ๆ
    return url;
  } catch {
    // malformed URL → fail-soft
    return url;
  }
}
