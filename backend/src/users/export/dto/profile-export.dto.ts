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
  type: string;
  time: IsoDateString;
  location: string | null;
  device: string | null;
};


export type ProfileExportPayload = {
  profile: ExportProfile;
  posts: ExportPost[];
  comments: ExportComment[];
  events?: ExportSecurityEvent[];
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

function mapEventType(type: string): string {
  switch (type) {
    case 'CREDENTIAL_VERIFIED':
      return 'Login verified';
    case 'PROFILE_EXPORTED':
      return 'Profile data downloaded';
    case 'ACCOUNT_LOCKED':
      return 'Account locked';
    default:
      return (
  type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
);

  }
}

function parseDevice(ua?: string | null): string | null {
  if (!ua) return null;

  if (ua.includes('Edg')) return 'Edge on Windows';
  if (ua.includes('Chrome') && ua.includes('Windows'))
    return 'Chrome on Windows';
  if (ua.includes('Mac')) return 'Browser on macOS';
  if (ua.includes('Android')) return 'Android device';
  if (ua.includes('iPhone')) return 'iPhone';

  return 'Unknown device';
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
      type: mapEventType(String(e.type)),
      time: toIso(e.createdAt),
      location: null, // reserved for future geo lookup
      device: parseDevice(e.userAgent),
    }),
  );


    // ==============================
    // Final payload
    // ==============================
    return {
  profile,
  posts: mappedPosts,
  comments: mappedComments,
  events: mappedSecurityEvents,
  stats: {
    followers: followers.length,
    following: following.length,
  },
};

  }
}
