// backend/src/posts/public/posts-public.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PostVisibility,
  VisibilityRuleType,
  PostUserTagStatus,
} from '@prisma/client';

@Injectable()
export class PostsPublicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicPostById(params: {
    postId: string;
    viewerUserId: string | null;
  }) {
    const { postId, viewerUserId } = params;

    return this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,

        AND: [
          {
            OR: [
              ...(viewerUserId
                ? [{ authorId: viewerUserId }]
                : []),

              { visibility: PostVisibility.PUBLIC },

              ...(viewerUserId
                ? [
                    {
                      visibility: PostVisibility.FOLLOWERS,
                      author: {
                        followers: {
                          some: { followerId: viewerUserId },
                        },
                      },
                    },
                  ]
                : []),

              ...(viewerUserId
                ? [
                    {
                      visibility: PostVisibility.CUSTOM,
                      visibilityRules: {
                        some: {
                          userId: viewerUserId,
                          rule: VisibilityRuleType.INCLUDE,
                        },
                      },
                    },
                  ]
                : []),
            ],
          },

          ...(viewerUserId
            ? [
                {
                  visibilityRules: {
                    none: {
                      userId: viewerUserId,
                      rule: VisibilityRuleType.EXCLUDE,
                    },
                  },
                },
              ]
            : []),
        ],

        ...(viewerUserId
          ? {
              AND: [
                {
                  author: {
                    blockedBy: {
                      none: { blockerId: viewerUserId },
                    },
                  },
                },
                {
                  author: {
                    blockedUsers: {
                      none: { blockedId: viewerUserId },
                    },
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,

        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },

        media: {
          select: {
            media: {
              select: {
                id: true,
                mediaType: true,
                objectKey: true,
                width: true,
                height: true,
                duration: true,
              },
            },
          },
        },

        userTags: {
          where: { status: PostUserTagStatus.ACCEPTED },
          select: {
            taggedUser: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }
}
