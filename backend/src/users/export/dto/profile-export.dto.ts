// backend/src/users/export/dto/profile-export.dto.ts

type IsoDateString = string;

/* ==============================
   Export Types
   ============================== */

export type ExportProfile = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  createdAt: IsoDateString;
};

export type ExportPost = {
  id: string;
  content: string;
  createdAt: IsoDateString;
};

export type ExportComment = {
  id: string;
  content: string;
  createdAt: IsoDateString;
};

export type ExportSecurityEvent = {
  id: string;
  type: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: IsoDateString;
};

export type ProfileExportPayload = {
  profile: ExportProfile;
  posts: ExportPost[];
  comments: ExportComment[];
  securityEvents?: ExportSecurityEvent[]; // optional for backward compatibility
  stats: {
    followers: number;
    following: number;
  };
};

/* ==============================
   Helpers
   ============================== */

function toIso(value: any): IsoDateString {
  if (!value) return new Date(0).toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

/* ==============================
   DTO Mapper
   ============================== */

export class ProfileExportDto {
  static fromEntity(entity: any): ProfileExportPayload | null {
    if (!entity || typeof entity !== 'object') {
      return null;
    }

    const posts = Array.isArray(entity.posts)
      ? entity.posts
      : [];

    const comments = Array.isArray(entity.comments)
      ? entity.comments
      : [];

    const followers = Array.isArray(entity.followers)
      ? entity.followers
      : [];

    const following = Array.isArray(entity.following)
      ? entity.following
      : [];

    const securityEvents = Array.isArray(entity.securityEvents)
      ? entity.securityEvents
      : [];

    // ==============================
    // Profile (PII — explicit allow-list)
    // ==============================
    const profile: ExportProfile = {
      id: String(entity.id),
      email: String(entity.email),
      username: String(entity.username),
      displayName: entity.displayName ?? null,
      bio: entity.bio ?? null,
      createdAt: toIso(entity.createdAt),
    };

    // ==============================
    // Posts
    // ==============================
    const mappedPosts: ExportPost[] = posts.map(
      (p: any): ExportPost => ({
        id: String(p.id),
        content: String(p.content ?? ''),
        createdAt: toIso(p.createdAt),
      }),
    );

    // ==============================
    // Comments
    // ==============================
    const mappedComments: ExportComment[] =
      comments.map((c: any): ExportComment => ({
        id: String(c.id),
        content: String(c.content ?? ''),
        createdAt: toIso(c.createdAt),
      }));

    // ==============================
    // Security events (safe subset)
    // ==============================
    const mappedSecurityEvents: ExportSecurityEvent[] =
      securityEvents.map(
        (e: any): ExportSecurityEvent => ({
          id: String(e.id),
          type: String(e.type),
          ip: e.ip ?? null,
          userAgent: e.userAgent ?? null,
          createdAt: toIso(e.createdAt),
        }),
      );

    // ==============================
    // Final payload
    // ==============================
    return {
      profile,
      posts: mappedPosts,
      comments: mappedComments,
      securityEvents: mappedSecurityEvents,
      stats: {
        followers: followers.length,
        following: following.length,
      },
    };
  }
}
