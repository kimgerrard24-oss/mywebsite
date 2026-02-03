// backend/src/posts/dto/post-detail.dto.ts

import { MediaType, PostVisibility } from '@prisma/client';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class PostDetailDto {
  id!: string;
  content!: string;
  createdAt!: Date;
  visibility!: PostVisibility;

  isRepost!: boolean;

  originalPost?: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
    media: {
      id: string;
      type: 'image' | 'video';
      url: string;
    }[];
  };

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

  repostCount!: number;
  
  hasReposted?: boolean;
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

    const isRepost = post.type === 'REPOST';

    /**
     * 🚨 Moderation snapshot (fail-soft)
     */
    const hasActiveModeration =
      post.isHidden === true ||
      post.isDeleted === true;

    // ==============================
// 🆕 Map friend tags (fail-soft)
// ==============================
const userTags = Array.isArray(post.userTags)
  ? post.userTags
      .filter((t: any) => {
        const u = t.taggedUser;
        if (!u) return false;
        if (u.isDisabled) return false;
        if (u.isBanned) return false;
        if (u.active === false) return false;
        return true;
      })
      .map((t: any) => {
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

        isRepost,

    originalPost:
      isRepost && post.originalPost
        ? {
            id: post.originalPost.id,
            content: post.originalPost.content,
            createdAt: post.originalPost.createdAt,
            author: {
              id: post.originalPost.author.id,
              displayName: post.originalPost.author.displayName,
              avatarUrl: post.originalPost.author.avatarUrl,
            },
            media: Array.isArray(post.originalPost.media)
              ? post.originalPost.media.map((pm: any) => ({
                  id: pm.media.id,
                  type:
                    pm.media.mediaType === MediaType.IMAGE
                      ? 'image'
                      : 'video',
                  url: buildCdnUrl(pm.media.objectKey),
                }))
              : [],
          }
        : undefined, 

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
      repostCount: post.repostCount ?? 0,
      
      isLikedByViewer: viewerUserId
        ? Array.isArray(post.likes) && post.likes.length > 0
        : false,

      canDelete: Boolean(isOwner),
      canAppeal: Boolean(isOwner && hasActiveModeration),

      userTags,
    };
  }
}
