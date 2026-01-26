// backend/src/posts/dto/post-detail.dto.ts

import { MediaType, PostVisibility } from '@prisma/client';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class PostDetailDto {
  id!: string;
  content!: string;
  createdAt!: Date;
  visibility!: PostVisibility;

  author!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  media!: {
    id: string;
    type: 'image' | 'video';
    url: string;
  }[];

  likeCount!: number;
  commentCount!: number;

  isLikedByViewer!: boolean;
  canDelete!: boolean;

  /**
   * 📨 Appeal (UX guard only)
   */
  canAppeal?: boolean;

  // ==============================
  // 🆕 Friend Tags (UX only)
  // ==============================
  userTags!: {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REMOVED';

    isTaggedUser: boolean;
    isPostOwner: boolean;

    taggedUser: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }[];

  static from(
    post: any,
    viewerUserId?: string,
  ): PostDetailDto {
    const isOwner =
      Boolean(viewerUserId) &&
      post.author?.id === viewerUserId;

    /**
     * 🚨 Moderation snapshot (fail-soft)
     */
    const hasActiveModeration =
      post.isHidden === true ||
      post.isDeleted === true;

    // ==============================
    // 🆕 Map friend tags (fail-soft)
    // ==============================
    const userTags = Array.isArray(post.postUserTags)
      ? post.postUserTags.map((t: any) => {
          const isTaggedUser =
            Boolean(viewerUserId) &&
            t.taggedUserId === viewerUserId;

          const isPostOwner =
            Boolean(viewerUserId) &&
            post.author?.id === viewerUserId;

          return {
            id: t.id,
            status: t.status,

            isTaggedUser,
            isPostOwner,

            taggedUser: {
              id: t.taggedUser.id,
              username: t.taggedUser.username,
              displayName: t.taggedUser.displayName,
              avatarUrl: t.taggedUser.avatarUrl,
            },
          };
        })
      : [];

    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      visibility: post.visibility,

      author: {
        id: post.author.id,
        displayName: post.author.displayName,
        avatarUrl: post.author.avatarUrl,
      },

      media: Array.isArray(post.media)
        ? post.media.map((pm: any) => ({
            id: pm.media.id,
            type:
              pm.media.mediaType === MediaType.IMAGE
                ? 'image'
                : 'video',
            url: buildCdnUrl(pm.media.objectKey),
          }))
        : [],

      likeCount: post.likeCount ?? 0,
      commentCount: post.commentCount ?? 0,

      isLikedByViewer: viewerUserId
        ? Array.isArray(post.likes) && post.likes.length > 0
        : false,

      canDelete: Boolean(isOwner),

      canAppeal: Boolean(isOwner && hasActiveModeration),

      // ✅ new field
      userTags,
    };
  }
}
