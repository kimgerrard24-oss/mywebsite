// backend/src/comments/replies/comments-replies.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type ParentCommentForReply = Prisma.CommentGetPayload<{
  select: {
    id: true;
    postId: true;
    parentId: true;
    authorId: true;
    isDeleted: true;
  };
}>;

@Injectable()
export class CommentsRepliesRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * =====================================================
   * Find parent comment for reply
   * =====================================================
   */
  async findParentComment(
    commentId: string,
  ): Promise<ParentCommentForReply | null> {
    return this.prisma.comment.findFirst({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        postId: true,
        parentId: true,
        authorId: true,
        isDeleted: true,
      },
    });
  }

  async createReply(params: {
    postId: string;
    parentCommentId: string;
    authorId: string;
    content: string;
  }) {
    return this.prisma.comment.create({
      data: {
        postId: params.postId,
        parentId: params.parentCommentId,
        authorId: params.authorId,
        content: params.content,
      },
    });
  }

  /**
   * =====================================================
   * Find replies (with block enforcement when viewer exists)
   * =====================================================
   */
  async findReplies(params: {
    parentCommentId: string;
    limit: number;
    cursor?: string;
    viewerUserId?: string | null; // ✅ NEW (optional)
  }) {
    const {
      parentCommentId,
      limit,
      cursor,
      viewerUserId,
    } = params;

    return this.prisma.comment.findMany({
      where: {
        parentId: parentCommentId,
        isDeleted: false,

        // ===== BLOCK FILTER (2-way, only when viewer exists) =====
        ...(viewerUserId
          ? {
              author: {
                AND: [
                  // viewer does NOT block author
                  {
                    blockedBy: {
                      none: {
                        blockerId: viewerUserId,
                      },
                    },
                  },

                  // author does NOT block viewer
                  {
                    blockedUsers: {
                      none: {
                        blockedId: viewerUserId,
                      },
                    },
                  },
                ],
              },
            }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,

      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),

      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * =====================================================
   * Find readable post by parent comment
   * (no block here — enforced at service layer)
   * =====================================================
   */
  async findReadablePostByParentComment(
    parentCommentId: string,
  ) {
    return this.prisma.post.findFirst({
      where: {
        comments: {
          some: {
            id: parentCommentId,
            isDeleted: false,
          },
        },
        isDeleted: false,
        isHidden: false,
        isPublished: true,
      },
      select: { id: true },
    });
  }

  /**
   * =====================================================
   * Block relation helper (2-way)
   * - for create reply / mention enforcement in service
   * =====================================================
   */
  async isBlockedBetween(params: {
    userA: string;
    userB: string;
  }): Promise<boolean> {
    const { userA, userB } = params;

    const blocked =
      await this.prisma.userBlock.findFirst({
        where: {
          OR: [
            {
              blockerId: userA,
              blockedId: userB,
            },
            {
              blockerId: userB,
              blockedId: userA,
            },
          ],
        },
        select: { blockerId: true },
      });

    return Boolean(blocked);
  }

  async createReplyMentions(params: {
    replyId: string;
    userIds: string[];
  }) {
    if (params.userIds.length === 0) return;

    await this.prisma.commentMention.createMany({
      data: params.userIds.map((userId) => ({
        commentId: params.replyId, // reply = comment
        userId,
      })),
      skipDuplicates: true,
    });
  }

  async upsertTags(names: string[]) {
    return Promise.all(
      names.map((name) =>
        this.prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
          select: { id: true },
        }),
      ),
    );
  }

  async createCommentTags(params: {
    commentId: string;
    tagIds: string[];
  }) {
    if (params.tagIds.length === 0) return;

    await this.prisma.commentTag.createMany({
      data: params.tagIds.map((tagId) => ({
        commentId: params.commentId,
        tagId,
      })),
      skipDuplicates: true,
    });
  }
}
