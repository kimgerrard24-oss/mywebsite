// backend/src/users/export/dto/profile-export.dto.ts

type ExportPost = {
  id: string;
  content: string;
  createdAt: string;
};

type ExportComment = {
  id: string;
  content: string;
  createdAt: string;
};

export class ProfileExportDto {
  static fromEntity(entity: any) {
    if (!entity) return null;

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

    return {
      profile: {
        id: entity.id,
        email: entity.email,
        username: entity.username,
        displayName: entity.displayName ?? null,
        bio: entity.bio ?? null,
        createdAt:
          entity.createdAt instanceof Date
            ? entity.createdAt.toISOString()
            : entity.createdAt,
      },

      posts: posts.map(
        (p: any): ExportPost => ({
          id: p.id,
          content: p.content,
          createdAt:
            p.createdAt instanceof Date
              ? p.createdAt.toISOString()
              : p.createdAt,
        }),
      ),

      comments: comments.map(
        (c: any): ExportComment => ({
          id: c.id,
          content: c.content,
          createdAt:
            c.createdAt instanceof Date
              ? c.createdAt.toISOString()
              : c.createdAt,
        }),
      ),

      stats: {
        followers: followers.length,
        following: following.length,
      },
    };
  }
}
