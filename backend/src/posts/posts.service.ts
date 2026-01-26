// backend/src/posts/posts.service.ts
import { 
  Injectable, 
  NotFoundException,
  BadRequestException,
  ForbiddenException,
 } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostCreatePolicy } from './policy/post-create.policy';
import { PostAudit } from './audit/post.audit';
import { PostCreatedEvent } from './events/post-created.event';
import { PostFeedMapper } from './mappers/post-feed.mapper';
import { PostsVisibilityService } from './visibility/posts-visibility.service';
import { PostCacheService } from './cache/post-cache.service';
import { PostDetailDto } from './dto/post-detail.dto';
import { PostDeletePolicy } from './policy/post-delete.policy';
import { PostUpdatePolicy } from './policy/post-update.policy';
import { PostMediaPolicy } from './policy/post-media.policy';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUserPostsQuery } from './dto/get-user-posts.query';
import { PostFeedItemDto } from './dto/post-feed-item.dto';
import { parseHashtags } from './utils/parse-hashtags.util';
import { PostLikePolicy } from './policy/post-like.policy';
import { PostLikeResponseDto } from './dto/post-like-response.dto';
import { PostLikedEvent } from './events/post-liked.event';
import { PostUnlikePolicy } from './policy/post-unlike.policy';
import { PostUnlikeResponseDto } from './dto/post-unlike-response.dto';
import { PostLikeDto } from './dto/post-like.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostVisibility, VisibilityRuleType, PostUserTagStatus } from '@prisma/client';
import { UpdatePostVisibilityDto } from './dto/update-post-visibility.dto';
import { PostVisibilityRulesDto } from './dto/post-visibility-rules.dto';
import { PostUserTagUpdatePolicy } from './policy/post-user-tag-update.policy';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { PostUserTagUpdatedEvent } from './events/post-user-tag.events';
import { PostUserTagRemovePolicy } from './policy/post-user-tag-remove.policy';
import { PostUserTagDto } from './dto/post-user-tag.dto';
import { PostUserTagViewPolicy } from './policy/post-user-tag-view.policy';
import { PostUserTagAcceptPolicy } from './policy/post-user-tag-accept.policy';
import { PostUserTagRejectPolicy } from './policy/post-user-tag-reject.policy';
import { PostUserTagCreatePolicy } from './policy/post-user-tag-create.policy';

@Injectable()
export class PostsService {
  constructor(
    private readonly repo: PostsRepository,
    private readonly audit: PostAudit,
    private readonly postCreatedEvent: PostCreatedEvent,
    private readonly visibility: PostsVisibilityService,
    private readonly cache: PostCacheService,
    private readonly prisma: PrismaService,
    private readonly policy: PostLikePolicy,
    private readonly postLikedEvent: PostLikedEvent,
    private readonly unlikePolicy: PostUnlikePolicy,
    private readonly postslikes: PostsRepository,
    private readonly notifications: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

async createPost(params: {
  authorId: string;
  dto?: CreatePostDto;
  content?: string;
}) {
  const { authorId } = params;

  const content =
    params.dto?.content ??
    params.content ??
    '';

  const mediaIds =
    params.dto?.mediaIds ?? [];

  const visibility =
    params.dto?.visibility ?? PostVisibility.PUBLIC;

  const includeUserIds =
    params.dto?.includeUserIds ?? [];

  const excludeUserIds =
    params.dto?.excludeUserIds ?? [];

  const taggedUserIds =
    params.dto?.taggedUserIds ?? [];

  // =========================
  // Policy: capability + payload
  // =========================
  PostCreatePolicy.assertCanCreatePost();

  PostCreatePolicy.assertValid({
    content,
    mediaCount: mediaIds.length,
  });

  PostCreatePolicy.assertValidTaggedUsers({
    taggedUserCount: taggedUserIds.length,
  });

  // =========================
  // Media ownership check
  // =========================
  if (mediaIds.length > 0) {
    const mediaList = await this.prisma.media.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true, ownerUserId: true },
    });

    if (mediaList.length !== mediaIds.length) {
      throw new BadRequestException(
        'Some media not found',
      );
    }

    for (const media of mediaList) {
      PostMediaPolicy.assertOwnership({
        actorUserId: authorId,
        ownerUserId: media.ownerUserId,
      });
    }
  }

  /**
   * =================================================
   * DB TRANSACTION (AUTHORITY)
   * =================================================
   */
  const post = await this.prisma.$transaction(
    async (tx) => {
      // -------------------------
      // 1) Create post
      // -------------------------
      const createdPost = await tx.post.create({
        data: {
          authorId,
          content,
          visibility,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      // -------------------------
      // 2) Attach media
      // -------------------------
      if (mediaIds.length > 0) {
        await tx.postMedia.createMany({
          data: mediaIds.map((mediaId) => ({
            postId: createdPost.id,
            mediaId,
          })),
          skipDuplicates: true,
        });
      }

      // -------------------------
      // 3) Visibility rules (CUSTOM only)
      // -------------------------
      if (visibility === PostVisibility.CUSTOM) {
        const rules = [
          ...includeUserIds.map((userId) => ({
            postId: createdPost.id,
            userId,
            rule: VisibilityRuleType.INCLUDE,
          })),
          ...excludeUserIds.map((userId) => ({
            postId: createdPost.id,
            userId,
            rule: VisibilityRuleType.EXCLUDE,
          })),
        ];

        if (rules.length > 0) {
          await tx.postVisibilityRule.createMany({
            data: rules,
            skipDuplicates: true,
          });
        }
      }

      // -------------------------
      // 4) Hashtags (fail-soft)
      // -------------------------
      try {
        const tags = parseHashtags(content);

        if (tags.length > 0) {
          const tagRows = await Promise.all(
            tags.map((name) =>
              tx.tag.upsert({
                where: { name },
                update: {},
                create: { name },
                select: { id: true },
              }),
            ),
          );

          await tx.postTag.createMany({
            data: tagRows.map((tag) => ({
              postId: createdPost.id,
              tagId: tag.id,
            })),
            skipDuplicates: true,
          });

          // ✅ ensure Tag.postCount consistency
          await tx.tag.updateMany({
            where: {
              id: { in: tagRows.map((t) => t.id) },
            },
            data: {
              postCount: { increment: 1 },
            },
          });
        }
      } catch {
        // ❗ hashtag must never break post creation
      }

      // -------------------------
      // 5) Friend Tags (fail-soft, policy-based)
      // -------------------------
      if (taggedUserIds.length > 0) {
        try {
          // sanitize: remove self + duplicates
          const uniqueTaggedUserIds = Array.from(
            new Set(
              taggedUserIds.filter(
                (uid) => uid && uid !== authorId,
              ),
            ),
          );

          if (uniqueTaggedUserIds.length > 0) {
            // DB authority: load all contexts in one query
            const contexts =
              await this.repo
                .loadCreatePostUserTagContexts({
                  actorUserId: authorId,
                  taggedUserIds: uniqueTaggedUserIds,
                  tx,
                });

            const creates: {
              postId: string;
              taggedUserId: string;
              taggedByUserId: string;
              status: PostUserTagStatus;
            }[] = [];

            for (const ctx of contexts) {
              const decision =
  PostUserTagCreatePolicy.decideCreateTag({
    actorUserId: authorId,
    taggedUserId: ctx.taggedUserId,
    isBlockedEitherWay: ctx.isBlockedEitherWay,
    isFollower: ctx.isFollower,
    isFollowing: ctx.isFollowing,
    isPrivateAccount: ctx.isPrivateAccount,
    setting: ctx.setting,
  });


              if (!decision.allowed) continue;

              creates.push({
                postId: createdPost.id,
                taggedUserId: ctx.taggedUserId,
                taggedByUserId: authorId,
                status: decision.autoAccept
                  ? PostUserTagStatus.ACCEPTED
                  : PostUserTagStatus.PENDING,
              });
            }

            if (creates.length > 0) {
              await tx.postUserTag.createMany({
                data: creates,
                skipDuplicates: true,
              });
            }
          }
        } catch {
          // ❗ friend tag system must never break post creation
        }
      }

      return createdPost;
    },
  );

  /**
   * =================================================
   * AUDIT (FAIL-SOFT)
   * =================================================
   */
  try {
    await this.audit.logPostCreated({
      postId: post.id,
      authorId,
    });
  } catch {}

  /**
   * =================================================
   * DOMAIN EVENT → ASYNC FEED FAN-OUT WORKER
   * =================================================
   */
  try {
    this.eventEmitter.emit('post.created', {
      id: post.id,
      authorId,
      createdAt: post.createdAt,
      mediaIds,
    });
  } catch {
    // ❗ feed / realtime must never break post creation
  }

  /**
   * =================================================
   * NOTIFICATION (LOGICAL EVENT ONLY)
   * Notification domain handles:
   * DB → Redis → Realtime
   * =================================================
   */
  if (taggedUserIds.length > 0) {
    try {
      // DB authority: notify only actual created tags
      const tags = await this.prisma.postUserTag.findMany({
        where: {
          postId: post.id,
          status: {
            in: [
              PostUserTagStatus.PENDING,
              PostUserTagStatus.ACCEPTED,
            ],
          },
        },
        select: {
          taggedUserId: true,
          status: true,
        },
      });

      for (const t of tags) {
        await this.notifications.createNotification({
          userId: t.taggedUserId,
          actorUserId: authorId,
          type:
            t.status === PostUserTagStatus.ACCEPTED
              ? 'post_tagged_auto_accepted'
              : 'post_tagged_request',
          entityId: post.id,
          payload: {
            postId: post.id,
          },
        });
      }
    } catch {
      // ❗ notification must never break post creation
    }
  }

  return {
    id: post.id,
    createdAt: post.createdAt,
  };
}

 
async getPublicFeed(params: {
  viewerUserId: string | null;
  limit: number;
  cursor?: string;

  /**
   * 🔥 OPTIONAL
   * - 'video' = ใช้สำหรับ right video feed (TikTok-style)
   * - undefined = feed ปกติ (text / image / video ปนกัน)
   */
  mediaType?: 'video';
}) {
  const {
    viewerUserId,
    limit,
    cursor,
    mediaType,
  } = params;

  // =================================================
  // 1) Load candidate posts (DB pre-filter only)
  //    - isDeleted / isHidden / block / mediaType
  //    - visibility here is NOT final authority
  // =================================================
  const rows = await this.repo.findPublicFeed({
    limit,
    cursor,
    viewerUserId,
    mediaType, // pass-through (right video feed)
  });

  // =================================================
  // 2) Final Authority Decision (Post-level)
  //    - Single source of truth
  //    - Same logic as post detail / validate
  // =================================================
  const visiblePosts: typeof rows = [];

  for (const post of rows) {
  const decision = await this.visibility.validateVisibility({
    postId: post.id,
    viewerUserId,
  });

  if (decision.canView) {
    visiblePosts.push(post);
  }
}


  // =================================================
  // 3) Map DTO (UX layer only, no authority here)
  // =================================================
  const items = visiblePosts.map((post) =>
    PostFeedMapper.toDto(post, viewerUserId),
  );

  // =================================================
  // 4) Cursor (based on visible items only)
  // =================================================
  const nextCursor =
    items.length === limit
      ? items[items.length - 1].id
      : null;

  return {
    items,
    nextCursor,
  };
}




 async getPostDetail(params: {
  postId: string;
  viewer: { userId: string; jti: string } | null;
}): Promise<PostDetailDto | null> {
  const { postId, viewer } = params;

  // 1) Public cache
  if (!viewer) {
    const cached = await this.cache.get(postId);
    if (cached) return cached;
  }

  // 2) Load post (with author)
  const post = await this.repo.findPostById(
    postId,
    viewer?.userId,
  );
  if (!post) return null;

  // =====================================================
  // 🔒 HARD BLOCK GUARD (2-way)
  // - viewer block author
  // - author block viewer
  // - deny BEFORE visibility & mapping
  // =====================================================
  if (viewer?.userId) {
    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: viewer.userId,
            blockedId: post.author.id,
          },
          {
            blockerId: post.author.id,
            blockedId: viewer.userId,
          },
        ],
      },
      select: { blockerId: true },
    });

    if (blocked) {
      // production behavior:
      // - do not reveal existence
      return null;
    }
  }

  // 3) Visibility (final authority)
const decision = await this.visibility.validateVisibility({
  postId: post.id,
  viewerUserId: viewer?.userId ?? null,
});

if (!decision.canView) return null;


  // 4) Map DTO
  const dto = PostDetailDto.from(
    post,
    viewer?.userId,
  );

  // ⛔️ logic เดิม (ไม่แตะ)
  dto.canDelete =
    !!viewer &&
    post.isDeleted === false &&
    viewer.userId === post.author.id;

  // 5) Cache
  const isPublicPost =
    post.visibility === 'PUBLIC' &&
    post.isDeleted === false &&
    post.isHidden === false;

  if (isPublicPost && !viewer) {
    await this.cache.set(postId, dto);
  }

  return dto;
}



async deletePost(params: { postId: string; actorUserId: string }) {
  const { postId, actorUserId } = params;

  const post = await this.repo.findById(postId);
  if (!post || post.isDeleted) {
    throw new NotFoundException('Post not found');
  }

  PostDeletePolicy.assertCanDelete({
    actorUserId,
    ownerUserId: post.authorId,
  });

  // =========================
  // Load tag ids (before tx)
  // =========================
  let tagIds: string[] = [];

  try {
    const rows = await this.prisma.postTag.findMany({
      where: { postId },
      select: { tagId: true },
    });

    tagIds = rows.map((r) => r.tagId);
  } catch {
    // ❗ tag cleanup must never block delete
  }

  // =========================
  // DB Transaction (authority)
  // =========================
  await this.prisma.$transaction(async (tx) => {
    // ✅ 1) mark media.deletedAt
    await tx.media.updateMany({
      where: {
        posts: {
          some: { postId },
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        cleanupAt: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ),
      },
    });

    // -------------------------
    // 2) soft delete post (via repo, tx-safe)
    // -------------------------
    await this.repo.softDeleteTx(postId, tx);

    // -------------------------
    // 3) remove postTag + decrement counter
    // -------------------------
    if (tagIds.length > 0) {
      await tx.postTag.deleteMany({
        where: { postId },
      });

      await tx.tag.updateMany({
        where: {
          id: { in: tagIds },
        },
        data: {
          postCount: { decrement: 1 },
        },
      });
    }
  });

  await this.audit.logDeleted({
    postId,
    actorUserId,
  });
}




async updatePost(params: {
  postId: string;
  actorUserId: string;
  content: string;
}) {
  const { postId, actorUserId, content } = params;

  const post = await this.repo.findById(postId);
  if (!post || post.isDeleted) {
    throw new NotFoundException('Post not found');
  }

  PostUpdatePolicy.assertCanUpdate({
    actorUserId,
    ownerUserId: post.authorId,
  });

  // =========================
  // Hashtag diff (before tx)
  // =========================
  let toAdd: string[] = [];
  let toRemove: string[] = [];

  try {
    const nextTags = parseHashtags(content);

    const existing = await this.prisma.postTag.findMany({
      where: { postId },
      select: {
        tag: { select: { id: true, name: true } },
      },
    });

    const prevNames = new Set(existing.map((t) => t.tag.name));
    const nextNames = new Set(nextTags);

    toAdd = nextTags.filter((n) => !prevNames.has(n));
    toRemove = existing
      .filter((t) => !nextNames.has(t.tag.name))
      .map((t) => t.tag.id);
  } catch {
    // ❗ hashtag diff must never block update
  }

  // =========================
  // DB Transaction (authority)
  // =========================
  const updated = await this.prisma.$transaction(async (tx) => {
    // -------------------------
    // 1) Update post content
    // -------------------------
    const u = await tx.post.update({
      where: { id: postId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      select: {
        id: true,
        content: true,
        editedAt: true,
      },
    });

    // -------------------------
    // 2) Remove old tags
    // -------------------------
    if (toRemove.length > 0) {
      await tx.postTag.deleteMany({
        where: {
          postId,
          tagId: { in: toRemove },
        },
      });

      await tx.tag.updateMany({
        where: {
          id: { in: toRemove },
        },
        data: {
          postCount: { decrement: 1 },
        },
      });
    }

    // -------------------------
    // 3) Add new tags
    // -------------------------
    if (toAdd.length > 0) {
      const tagRows = await Promise.all(
        toAdd.map((name) =>
          tx.tag.upsert({
            where: { name },
            update: {},
            create: { name },
            select: { id: true },
          }),
        ),
      );

      await tx.postTag.createMany({
        data: tagRows.map((t) => ({
          postId,
          tagId: t.id,
        })),
        skipDuplicates: true,
      });

      await tx.tag.updateMany({
        where: {
          id: { in: tagRows.map((t) => t.id) },
        },
        data: {
          postCount: { increment: 1 },
        },
      });
    }

    return u;
  });

  await this.audit.logUpdated({
    postId,
    actorUserId,
  });

  await this.cache.invalidate(postId);

  return {
    id: updated.id,
    content: updated.content,
    editedAt: updated.editedAt,
  };
}

 

async getUserPostFeed(params: {
  targetUserId: string;
  query: GetUserPostsQuery;
  viewer: { userId: string } | null;
}) {
  const { targetUserId, query, viewer } = params;

  // =====================================================
  // 🔒 HARD BLOCK GUARD (2-way)
  // - viewer block target
  // - target block viewer
  // - deny at service level (authority)
  // =====================================================
  if (viewer?.userId) {
    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: viewer.userId,
            blockedId: targetUserId,
          },
          {
            blockerId: targetUserId,
            blockedId: viewer.userId,
          },
        ],
      },
      select: { blockerId: true },
    });

    if (blocked) {
      // production behavior:
      // - do not reveal block
      // - behave as not found
      throw new NotFoundException();
    }
  }

  // =====================================================
  // 🔐 ACCOUNT-LEVEL VISIBILITY (PROFILE GATE) — KEEP
  // =====================================================
  const visibilityScope =
    await this.visibility.resolveUserPostVisibility({
      targetUserId,
      viewer,
    });

  // =====================================================
  // PROFILE FEED VISIBILITY
  // - public profile → always viewable
  // - private profile → must satisfy canView
  // =====================================================
  if (
    visibilityScope.scope !== 'public' &&
    !visibilityScope.canView
  ) {
    return { items: [], nextCursor: null };
  }

  const effectiveLimit = query.limit ?? 20;

  // =====================================================
  // 1) Load candidate posts (DB pre-filter only)
  //    - authorId
  //    - isDeleted / isHidden
  //    - block (repo responsibility)
  //    - post-level visibility here is NOT final authority
  // =====================================================
  const rows = await this.repo.findUserPosts({
    userId: targetUserId,
    viewerUserId: viewer?.userId ?? null,
    limit: effectiveLimit,
    cursor: query.cursor,
    scope: visibilityScope.scope,
  });

  // =====================================================
  // 2) FINAL AUTHORITY DECISION (POST-LEVEL)
  //    - unify with post detail / feed / tag
  // =====================================================
  const visiblePosts: typeof rows = [];

  for (const post of rows) {
  const decision = await this.visibility.validateVisibility({
    postId: post.id,
    viewerUserId: viewer?.userId ?? null,
  });

  if (decision.canView) {
    visiblePosts.push(post);
  }
}


  // =====================================================
  // 3) Map DTO (UX layer only)
  // =====================================================
  const items = visiblePosts.map((row) =>
    PostFeedMapper.toDto(row, viewer?.userId ?? null),
  );

  // =====================================================
  // 4) Cursor (based on visible items only)
  // =====================================================
  const nextCursor =
    items.length === effectiveLimit
      ? items[items.length - 1].id
      : null;

  return {
    items,
    nextCursor,
  };
}



async getPostsByTag(params: {
  tag: string;
  viewerUserId: string | null;
  cursor?: string;
  limit: number;
}): Promise<{
  items: PostFeedItemDto[];
  nextCursor: string | null;
}> {
  const { tag, viewerUserId, cursor, limit } = params;

  // =================================================
  // 1) Load candidate posts (DB pre-filter only)
  //    - tag
  //    - isDeleted / isHidden / block (repo responsibility)
  //    - visibility here is NOT final authority
  // =================================================
  const rows = await this.repo.findPostsByTag({
    tag,
    cursor,
    limit,
    viewerUserId,
  });

  // =================================================
  // 2) Final Authority Decision (Post-level)
  //    - Single source of truth
  // =================================================
  const visiblePosts: typeof rows = [];

  for (const post of rows) {
  const decision = await this.visibility.validateVisibility({
    postId: post.id,
    viewerUserId,
  });

  if (decision.canView) {
    visiblePosts.push(post);
  }
}

  // =================================================
  // 3) Map DTO (UX layer only)
  // =================================================
  const items = visiblePosts.map((row) =>
    PostFeedMapper.toDto(row, viewerUserId),
  );

  // =================================================
  // 4) Cursor (based on visible items only)
  // =================================================
  const nextCursor =
    items.length === limit
      ? items[items.length - 1].id
      : null;

  return { items, nextCursor };
}

  

async toggleLike(params: {
  postId: string;
  userId: string;
}): Promise<PostLikeResponseDto> {
  const { postId, userId } = params;

  // =================================================
  // 1) Load candidate post (DB pre-filter only)
  //    - isDeleted / isHidden / block / coarse visibility
  // =================================================
  const post = await this.repo.findPostForLike({
    postId,
    viewerUserId: userId,
  });

  if (!post) {
    // production behavior: do not reveal existence
    throw new NotFoundException('Post not found');
  }

  // =================================================
  // 2) FINAL AUTHORITY DECISION (POST-LEVEL)
  //    - unify with feed / post detail
  // =================================================
  const decision = await this.visibility.validateVisibility({
  postId,
  viewerUserId: userId,
});

if (!decision.canView) {
  // production behavior: behave as not found
  throw new NotFoundException('Post not found');
}


  // =================================================
  // 3) Business policy (unchanged)
  // =================================================
  this.policy.assertCanLike(post);

  // =================================================
  // 4) Toggle like (DB authority)
  // =================================================
  const result = await this.repo.toggleLike({
    postId,
    userId,
  });

  // =================================================
  // 5) AUDIT LOG (fail-soft)
  // =================================================
  try {
    await this.audit.logGeneric({
      userId,
      action: result.liked ? 'post.like' : 'post.unlike',
      targetId: postId,
    });
  } catch {}

  // =================================================
  // 6) CREATE NOTIFICATION (only when liked, fail-soft)
  // =================================================
  if (result.liked === true && post.authorId !== userId) {
    try {
      await this.notifications.createNotification({
        userId: post.authorId,
        actorUserId: userId,
        type: 'like',
        entityId: postId,
        payload: {
          postId,
        },
      });
    } catch {
      // ❗ notification fail must not affect like
    }
  }

  // =================================================
  // 7) DOMAIN EVENT (fan-out workers)
  // =================================================
  this.postLikedEvent.emit({
    postId,
    userId,
    liked: result.liked,
  });

  return result;
}




  async unlikePost(params: {
  postId: string;
  userId: string;
}): Promise<PostUnlikeResponseDto> {
  const { postId, userId } = params;

  // =================================================
  // 1) Load candidate post (DB pre-filter only)
  //    - isDeleted / isHidden / block / coarse visibility
  // =================================================
  const post = await this.repo.findPostForLike({
    postId,
    viewerUserId: userId,
  });

  if (!post) {
    // production behavior: do not reveal existence
    throw new NotFoundException('Post not found');
  }

  // =================================================
  // 2) FINAL AUTHORITY DECISION (POST-LEVEL)
  //    - unify with feed / post detail / like
  // =================================================
  const decision = await this.visibility.validateVisibility({
  postId,
  viewerUserId: userId,
});

if (!decision.canView) {
  // production behavior: behave as not found
  throw new NotFoundException('Post not found');
}


  // =================================================
  // 3) Business policy (unchanged)
  // =================================================
  this.unlikePolicy.assertCanUnlike(post);

  // =================================================
  // 4) Idempotent unlike (DB authority)
  // =================================================
  const result = await this.repo.unlike({ postId, userId });

  // =================================================
  // 5) AUDIT LOG (fail-soft)
  // =================================================
  try {
    await this.audit.logGeneric({
      userId,
      action: 'post.unlike',
      targetId: postId,
    });
  } catch {}

  return result;
}


  async getLikes(params: {
    postId: string;
    viewerUserId: string;
    cursor?: string;
    limit: number;
  }): Promise<{
    items: PostLikeDto[];
    nextCursor: string | null;
  }> {
    const { postId, cursor, limit } = params;

    const exists = await this.postslikes.existsPost(postId);
    if (!exists) {
      throw new NotFoundException('Post not found');
    }

    const { rows, nextCursor } =
      await this.repo.findLikesByPostId({
        postId,
        cursor,
        limit,
        viewerUserId: params.viewerUserId,
      });

    return {
      items: rows.map((row) => ({
        userId: row.user.id,
        displayName: row.user.displayName ?? null,
        avatarUrl: row.user.avatarUrl ?? null,
        likedAt: row.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async updatePostVisibility(params: {
  postId: string;
  actorUserId: string;
  dto: UpdatePostVisibilityDto;
}) {
  const { postId, actorUserId, dto } = params;

  // =================================================
  // 1) Load post (DB authority)
  // =================================================
  const post = await this.prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      isDeleted: true,
    },
  });

  if (!post || post.isDeleted) {
    throw new NotFoundException('Post not found');
  }

  // =================================================
  // 2) Ownership policy
  // =================================================
  if (post.authorId !== actorUserId) {
    throw new NotFoundException('Post not found');
  }

  const visibility = dto.visibility;

  const includeUserIds = Array.isArray(dto.includeUserIds)
    ? Array.from(new Set(dto.includeUserIds))
    : [];

  const excludeUserIds = Array.isArray(dto.excludeUserIds)
    ? Array.from(new Set(dto.excludeUserIds))
    : [];

  // =================================================
  // 3) Business policy (server-side authority)
  // =================================================
  if (visibility === PostVisibility.CUSTOM) {
    if (includeUserIds.length === 0 && excludeUserIds.length === 0) {
      throw new BadRequestException(
        'CUSTOM visibility requires include or exclude rules',
      );
    }

    if (
      includeUserIds.includes(actorUserId) ||
      excludeUserIds.includes(actorUserId)
    ) {
      throw new BadRequestException(
        'Owner cannot be included or excluded in custom visibility',
      );
    }
  }

  // =================================================
// 3.1) Validate target users exist (prevent orphan rules)
// =================================================
if (visibility === PostVisibility.CUSTOM) {
  const uniqueIds = Array.from(
    new Set([...includeUserIds, ...excludeUserIds]),
  );

  if (uniqueIds.length > 0) {
    const count = await this.prisma.user.count({
      where: {
        id: { in: uniqueIds },
      },
    });

    if (count !== uniqueIds.length) {
      throw new BadRequestException(
        'Some users not found for visibility rules',
      );
    }
  }
}

  // =================================================
  // 4) DB Transaction (authority)
  // =================================================
  await this.prisma.$transaction(async (tx) => {
    // -------------------------
    // 4.1 Update post visibility
    // -------------------------
    await tx.post.update({
      where: { id: postId },
      data: {
        visibility,
        overriddenByAdmin: false,
      },
    });

    // -------------------------
    // 4.2 Clear old rules
    // -------------------------
    await tx.postVisibilityRule.deleteMany({
      where: { postId },
    });

    // -------------------------
    // 4.3 Insert new rules (CUSTOM only)
    // -------------------------
    if (visibility === PostVisibility.CUSTOM) {
      const rules = [
        ...includeUserIds.map((userId) => ({
          postId,
          userId,
          rule: VisibilityRuleType.INCLUDE,
        })),
        ...excludeUserIds.map((userId) => ({
          postId,
          userId,
          rule: VisibilityRuleType.EXCLUDE,
        })),
      ];

      if (rules.length > 0) {
        await tx.postVisibilityRule.createMany({
          data: rules,
          skipDuplicates: true,
        });
      }
    }
  });

  // =================================================
  // 5) Audit (fail-soft) — keep signature compatible
  // =================================================
  try {
    await this.audit.logGeneric({
      userId: actorUserId,
      action: 'post.visibility.update',
      targetId: postId,
    });
  } catch {}

  // =================================================
  // 6) Cache invalidate
  // =================================================
  try {
    await this.cache.invalidate(postId);
  } catch {}

  // =================================================
  // 7) Domain event (fan-out workers)
  // =================================================
  try {
    this.eventEmitter.emit('post.visibility.updated', {
      postId,
      authorId: actorUserId,
      visibility,
    });
  } catch {}

  return { success: true };
}

async getPostVisibilityRules(params: {
  postId: string;
  actorUserId: string;
}): Promise<PostVisibilityRulesDto> {
  const { postId, actorUserId } = params;

  // =================================================
  // 1) Load post (DB authority)
  // =================================================
  const post = await this.prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      visibility: true,
      isDeleted: true,
    },
  });

  if (!post || post.isDeleted) {
    throw new NotFoundException('Post not found');
  }

  // =================================================
  // 2) Owner only
  // =================================================
  if (post.authorId !== actorUserId) {
    // production behavior: do not reveal existence
    throw new NotFoundException('Post not found');
  }

  // =================================================
  // 3) Non-CUSTOM → return empty rules
  // =================================================
  if (post.visibility !== 'CUSTOM') {
    return {
      visibility: post.visibility,
      includeUserIds: [],
      excludeUserIds: [],
    };
  }

  // =================================================
  // 4) Load rules
  // =================================================
  const rules =
    await this.repo.findPostVisibilityRules({
      postId,
    });

  const includeUserIds: string[] = [];
  const excludeUserIds: string[] = [];

  for (const r of rules) {
    if (r.rule === VisibilityRuleType.INCLUDE) {
      includeUserIds.push(r.userId);
    } else if (r.rule === VisibilityRuleType.EXCLUDE) {
      excludeUserIds.push(r.userId);
    }
  }

  return {
    visibility: post.visibility,
    includeUserIds,
    excludeUserIds,
  };
}

async updateTag(params: {
  actorUserId: string;
  dto: UpdatePostTagsDto;
}) {
  const { actorUserId, dto } = params;

  let event: PostUserTagUpdatedEvent | null = null;
  let result: { id: string; status: string } | null = null;

  await this.prisma.$transaction(async (tx) => {
    // =================================================
    // 1) Load context (DB authority)
    // =================================================
    const ctx = await this.repo.loadUpdateContext({
      tagId: dto.tagId,
      actorUserId,
      tx,
    });

    if (!ctx) {
      // production behavior: do not reveal existence
      throw new NotFoundException('Tag not found');
    }

    // =================================================
    // 2) Policy decision (FINAL AUTHORITY)
    // =================================================
    const decision = PostUserTagUpdatePolicy.decide({
      actorUserId,
      postAuthorId: ctx.postAuthorId,
      taggedUserId: ctx.taggedUserId,
      currentStatus: ctx.currentStatus,
      isBlockedEitherWay: ctx.isBlockedEitherWay,
    });

    if (!decision.allowed) {
      throw new ForbiddenException(
        'Not allowed to update this tag',
      );
    }

    if (!decision.allowedActions.includes(dto.action)) {
      throw new ForbiddenException(
        'Not allowed to update this tag',
      );
    }

    const nextStatus =
      PostUserTagUpdatePolicy.resolveNextStatus(
        dto.action,
      );

    // =================================================
    // 3) Update status (DB authority)
    // =================================================
    const updated = await tx.postUserTag.update({
      where: { id: ctx.tagId },
      data: {
        status: nextStatus,
        respondedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    // =================================================
    // 4) Prepare domain event (AFTER COMMIT)
    // =================================================
    event = new PostUserTagUpdatedEvent({
      postId: ctx.postId,
      tagId: ctx.tagId,
      status: updated.status,
      taggedUserId: ctx.taggedUserId,
      taggedByUserId: ctx.taggedByUserId,
    });

    result = {
      id: updated.id,
      status: updated.status,
    };
  });

  // =================================================
  // DOMAIN EVENT (AFTER COMMIT ONLY)
  // =================================================
  if (event) {
    try {
      this.eventEmitter.emit('post.tag.updated', event);
    } catch {
      // ❗ realtime / fan-out must never break response
    }
  }

  return result!;
}


 async removeMyTag(params: {
    postId: string;
    actorUserId: string;
  }) {
    const { postId, actorUserId } = params;

    return this.prisma.$transaction(async (tx) => {
      // -------------------------
      // 1) Load context (DB authority)
      // -------------------------
      const ctx =
        await this.repo.loadMyTagContext({
          postId,
          actorUserId,
          tx,
        });

      if (!ctx) {
        // production behavior: do not reveal existence
        throw new NotFoundException('Tag not found');
      }

      // -------------------------
      // 2) Policy decision (final)
      // -------------------------
      const decision =
        PostUserTagRemovePolicy.decide({
          actorUserId,
          taggedUserId: ctx.taggedUserId,
          taggedByUserId: ctx.taggedByUserId,
          postAuthorId: ctx.postAuthorId,
          currentStatus: ctx.status,
          isBlockedEitherWay: ctx.isBlockedEitherWay,
        });

      if (!decision.allowed) {
        throw new ForbiddenException(
          'Not allowed to remove this tag',
        );
      }

      // -------------------------
      // 3) Update status
      // -------------------------
      await tx.postUserTag.update({
        where: { id: ctx.tagId },
        data: {
          status: 'REMOVED',
          respondedAt: new Date(),
        },
      });

      // -------------------------
      // 4) Domain event (after commit)
      // -------------------------
      this.eventEmitter.emit(
        'post.tag.updated',
        new PostUserTagUpdatedEvent({
          postId,
          tagId: ctx.tagId,
          status: 'REMOVED',
          taggedUserId: ctx.taggedUserId,
          taggedByUserId: ctx.taggedByUserId,
        }),
      );

      return { success: true };
    });
  }

  async getPostUserTags(params: {
  postId: string;
  viewerUserId: string | null;
}): Promise<PostUserTagDto[]> {
  const { postId, viewerUserId } = params;

  // =================================================
  // 1) Enforce Post Visibility (FINAL AUTHORITY)
  // =================================================
  const decision =
    await this.visibility.validateVisibility({
      postId,
      viewerUserId,
    });

  if (!decision.canView) {
    throw new NotFoundException('Post not found');
  }

  // =================================================
  // 2) Load tag contexts
  // =================================================
  const rows = await this.repo.findPostUserTags({
    postId,
    viewerUserId,
  });

  // =================================================
  // 3) Policy filtering + mapping
  // =================================================
  const result: PostUserTagDto[] = [];

  for (const r of rows) {
    if (
      r.taggedUser.isDisabled ||
      r.taggedUser.isBanned ||
      !r.taggedUser.active
    ) {
      continue;
    }

    const isTaggedUser =
      viewerUserId === r.taggedUserId;

    const isPostOwner =
      viewerUserId === r.post.authorId;

    const blocked =
      (r.taggedUser.blockedBy?.length ?? 0) > 0 ||
      (r.taggedUser.blockedUsers?.length ?? 0) > 0;

    if (blocked) continue;

    const allowed =
      PostUserTagViewPolicy.canView({
        status: r.status,
        isPostOwner,
        isTaggedUser,
      });

    if (!allowed) continue;

    result.push({
      id: r.id,
      status: r.status,
      isTaggedUser,
      isPostOwner,
      taggedUser: {
        id: r.taggedUser.id,
        username: r.taggedUser.username,
        displayName: r.taggedUser.displayName,
        avatarUrl: r.taggedUser.avatarUrl,
      },
    });
  }

  return result;
}

async acceptPostTag(params: {
  postId: string;
  tagId: string;
  actorUserId: string;
}) {
  const { postId, tagId, actorUserId } = params;

  let event: PostUserTagUpdatedEvent | null = null;

  await this.prisma.$transaction(async (tx) => {
    // =================================================
    // 1) Load context (DB authority)
    // =================================================
    const ctx = await this.repo.loadAcceptTagContext({
      postId,
      tagId,
      actorUserId,
      tx,
    });

    if (!ctx) {
      throw new NotFoundException('Tag not found');
    }

    // =================================================
    // 2) Policy decision (FINAL)
    // =================================================
    const decision = PostUserTagAcceptPolicy.decide({
      actorUserId,
      taggedUserId: ctx.taggedUserId,
      currentStatus: ctx.status,
      isBlockedEitherWay: ctx.isBlockedEitherWay,
    });

    if (!decision.allowed) {
      throw new ForbiddenException('Not allowed to accept this tag');
    }

    // =================================================
    // 3) Update status
    // =================================================
    await tx.postUserTag.update({
      where: { id: ctx.tagId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // prepare event after commit
    event = new PostUserTagUpdatedEvent({
      postId: ctx.postId,
      tagId: ctx.tagId,
      status: 'ACCEPTED',
      taggedUserId: ctx.taggedUserId,
      taggedByUserId: ctx.taggedByUserId,
    });
  });

  // =================================================
  // 4) Domain Event (after commit only)
  // =================================================
  if (event) {
    try {
      this.eventEmitter.emit('post.tag.updated', event);
    } catch {}
  }

  return { success: true };
}


async rejectPostTag(params: {
  postId: string;
  tagId: string;
  actorUserId: string;
}) {
  const { postId, tagId, actorUserId } = params;

  let event: PostUserTagUpdatedEvent | null = null;

  await this.prisma.$transaction(async (tx) => {
    // =================================================
    // 1) Load context (DB authority)
    // =================================================
    const ctx = await this.repo.loadRejectTagContext({
      postId,
      tagId,
      actorUserId,
      tx,
    });

    if (!ctx) {
      throw new NotFoundException('Tag not found');
    }

    // =================================================
    // 2) Policy decision (FINAL)
    // =================================================
    const decision = PostUserTagRejectPolicy.decide({
      actorUserId,
      taggedUserId: ctx.taggedUserId,
      postAuthorId: ctx.postAuthorId,
      currentStatus: ctx.status,
      isBlockedEitherWay: ctx.isBlockedEitherWay,
    });

    if (!decision.allowed) {
      throw new ForbiddenException('Not allowed to reject this tag');
    }

    // =================================================
    // 3) Update status
    // =================================================
    await tx.postUserTag.update({
      where: { id: ctx.tagId },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });

    // prepare event AFTER COMMIT
    event = new PostUserTagUpdatedEvent({
      postId: ctx.postId,
      tagId: ctx.tagId,
      status: 'REJECTED',
      taggedUserId: ctx.taggedUserId,
      taggedByUserId: ctx.taggedByUserId,
    });
  });

  // =================================================
  // 4) Domain Event (after commit only)
  // =================================================
  if (event) {
    try {
      this.eventEmitter.emit('post.tag.updated', event);
    } catch {
      // ❗ realtime / fan-out must never break response
    }
  }

  return { success: true };
}

}
