// backend/src/users/export/dto/profile-export.dto.ts

export class ProfileExportDto {
  static fromEntity(entity: any) {
    if (!entity) return null;

    return {
      profile: {
        id: entity.id,
        email: entity.email,
        username: entity.username,
        displayName: entity.displayName,
        bio: entity.bio,
        createdAt: entity.createdAt,
      },

      posts: entity.posts.map((p: any) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
      })),

      comments: entity.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
      })),

      stats: {
        followers: entity.followers.length,
        following: entity.following.length,
      },
    };
  }
}
