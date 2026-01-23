// backend/src/posts/posts.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisibilityRuleType, PostVisibility } from '@prisma/client';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    authorId: string;
    content: string;
  }) {
    return this.prisma.post.create({
      data: {
        authorId: params.authorId,
        content: params.content,
      },
      select: {
        id: true,
        authorId: true,
        createdAt: true,
      },
    });
  }

async findPublicFeed(params: {
  limit?: number;
  cursor?: string;
  viewerUserId: string | null;
  mediaType?: 'video';
}) {
  const limit = params.limit ?? 20;
  const viewerUserId = params.viewerUserId;

  return this.prisma.post.findMany({
    take: limit,

    ...(params.cursor && {
      skip: 1,
      cursor: { id: params.cursor },
    }),

    orderBy: {
      createdAt: 'desc',
    },

    where: {
      // ===== BASE POST FILTER =====
      isDeleted: false,
      isHidden: false,

      // =================================================
      // 🔐 POST VISIBILITY AUTHORITY (PRODUCTION)
      // - PUBLIC
      // - FOLLOWERS (viewer must follow author)
      // - CUSTOM (INCLUDE rule)
      // - OWNER always allowed
      // - EXCLUDE always denied (handled below)
      // =================================================
      AND: [
        {
          OR: [
            // ===== OWNER =====
            ...(viewerUserId
              ? [
                  {
                    authorId: viewerUserId,
                  },
                ]
              : []),

            // ===== PUBLIC =====
            {
              visibility: PostVisibility.PUBLIC,
            },

            // ===== FOLLOWERS =====
            ...(viewerUserId
              ? [
                  {
                    visibility: PostVisibility.FOLLOWERS,
                    author: {
                      followers: {
                        some: {
                          followerId: viewerUserId,
                        },
                      },
                    },
                  },
                ]
              : []),

            // ===== CUSTOM (INCLUDE) =====
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

        // ===== EXCLUDE RULE OVERRIDE (DENY ALWAYS) =====
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

      // ===== MEDIA FILTER (right video feed) =====
      ...(params.mediaType === 'video'
        ? {
            media: {
              some: {
                media: {
                  mediaType: 'VIDEO',
                },
              },
            },
          }
        : {}),

      // ===== BLOCK ENFORCEMENT (2-way, production authority) =====
      ...(viewerUserId
        ? {
            AND: [
              // viewer must NOT block author
              {
                author: {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },
              },

              // author must NOT block viewer
              {
                author: {
                  blockedUsers: {
                    none: {
                      blockedId: viewerUserId,
                    },
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
          displayName: true,
          avatarUrl: true,

          // ===== privacy (UX only, not for feed gating) =====
          isPrivate: true,

          // ===== isFollowing (viewer → author) =====
          followers: viewerUserId
            ? {
                where: {
                  followerId: viewerUserId,
                },
                take: 1,
              }
            : false,

          // ===== follow request sent? (viewer → author) =====
          followRequestsReceived: viewerUserId
            ? {
                where: {
                  requesterId: viewerUserId,
                },
                take: 1,
              }
            : false,

          // ===== UX block flag (viewer blocked by author?) =====
          blockedBy: viewerUserId
            ? {
                where: {
                  blockerId: viewerUserId,
                },
                take: 1,
              }
            : false,
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
    },
  });
}


async findPostById(
  postId: string,
  viewerUserId?: string,
) {
  return this.prisma.post.findFirst({
    where: {
      id: postId,

      // ===== BASE POST FILTER =====
      isDeleted: false,
      isHidden: false,

      // =================================================
      // 🔐 POST VISIBILITY AUTHORITY (PRODUCTION)
      // =================================================
      AND: [
        {
          OR: [
            // ===== OWNER (always allowed) =====
            ...(viewerUserId
              ? [
                  {
                    authorId: viewerUserId,
                  },
                ]
              : []),

            // ===== PUBLIC =====
            {
              visibility: PostVisibility.PUBLIC,
            },

            // ===== FOLLOWERS =====
            ...(viewerUserId
              ? [
                  {
                    visibility: PostVisibility.FOLLOWERS,
                    author: {
                      followers: {
                        some: {
                          followerId: viewerUserId,
                        },
                      },
                    },
                  },
                ]
              : []),

            // ===== CUSTOM (INCLUDE) =====
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

        // ===== EXCLUDE RULE OVERRIDE (DENY ALWAYS) =====
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

      // ===== BLOCK ENFORCEMENT (2-way) =====
      ...(viewerUserId
        ? {
            AND: [
              // viewer must NOT block author
              {
                author: {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },
              },

              // author must NOT block viewer
              {
                author: {
                  blockedUsers: {
                    none: {
                      blockedId: viewerUserId,
                    },
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

      isPublished: true,
      isDeleted: true,
      isHidden: true,
      visibility: true,

      createdAt: true,

      // counters
      likeCount: true,
      commentCount: true,

      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },

      media: {
        select: {
          id: true,
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

      likes: viewerUserId
        ? {
            where: { userId: viewerUserId },
            select: { id: true },
          }
        : undefined,
    },
  });
}




  async findById(postId: string): Promise<{
    id: string;
    authorId: string;
    isDeleted: boolean;
  } | null> {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
      },
    });
  }

  async softDelete(postId: string) {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateContent(params: {
    postId: string;
    content: string;
  }) {
    const { postId, content } = params;

    return this.prisma.post.update({
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
  }

  async createPost(params: {
    authorId: string;
    content: string;
  }) {
    return this.prisma.post.create({
      data: {
        authorId: params.authorId,
        content: params.content,
      },
    });
  }

  async attachMedia(params: {
    postId: string;
    mediaIds: string[];
  }) {
    if (params.mediaIds.length === 0) {
      return;
    }

    await this.prisma.postMedia.createMany({
      data: params.mediaIds.map((mediaId) => ({
        postId: params.postId,
        mediaId,
      })),
      skipDuplicates: true,
    });
  }

async findUserPosts(params: {
  userId: string;
  viewerUserId: string | null;
  limit?: number;
  cursor?: string;
  scope: 'public' | 'self';
}) {
  const {
    userId,
    viewerUserId,
    limit = 20,
    cursor,
    scope,
  } = params;

  const isOwner = viewerUserId === userId;

  return this.prisma.post.findMany({
    where: {
      authorId: userId,

      // ===== BASE FILTER (DB authority) =====
      isDeleted: false,
      isHidden: false,

      // =================================================
      // 🔐 POST VISIBILITY (POST-LEVEL AUTHORITY)
      // - scope=self  → owner sees all (no visibility filter)
      // - scope=public:
      //    - PUBLIC
      //    - FOLLOWERS (viewer must follow author)
      //    - CUSTOM (INCLUDE rule)
      //    - PRIVATE (owner only)
      //    - EXCLUDE override always deny
      // =================================================
      ...(scope === 'public'
        ? {
            AND: [
              {
                OR: [
                  // ===== OWNER =====
                  ...(viewerUserId && isOwner
                    ? [
                        {
                          authorId: viewerUserId,
                        },
                      ]
                    : []),

                  // ===== PUBLIC =====
                  {
                    visibility: PostVisibility.PUBLIC,
                  },

                  // ===== FOLLOWERS =====
                  ...(viewerUserId
                    ? [
                        {
                          visibility: PostVisibility.FOLLOWERS,
                          author: {
                            followers: {
                              some: {
                                followerId: viewerUserId,
                              },
                            },
                          },
                        },
                      ]
                    : []),

                  // ===== CUSTOM (INCLUDE) =====
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

              // ===== EXCLUDE RULE OVERRIDE (DENY ALWAYS) =====
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
          }
        : {}),

      /**
       * IMPORTANT (KEEP):
       * - Account privacy (private / follower / self)
       *   is enforced in PostVisibilityService.resolveUserPostVisibility()
       * - Repository enforces only post-level visibility
       */

      // ===== BLOCK ENFORCEMENT (viewer ↔ author) =====
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

    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,

    orderBy: {
      createdAt: 'desc',
    },

    select: {
      id: true,
      content: true,
      createdAt: true,

      authorId: true,
      isHidden: true,
      isDeleted: true,
      visibility: true,
      likeCount: true,
      commentCount: true,

      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          isPrivate: true,

          // ===== UX flags (viewer → author) =====
          followers: viewerUserId
            ? {
                where: { followerId: viewerUserId },
                select: { followerId: true },
                take: 1,
              }
            : false,

          followRequestsReceived: viewerUserId
            ? {
                where: { requesterId: viewerUserId },
                select: { requesterId: true },
                take: 1,
              }
            : false,

          blockedBy: viewerUserId
            ? {
                where: { blockerId: viewerUserId },
                select: { blockerId: true },
                take: 1,
              }
            : false,
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
    },
  });
}



async findPostsByTag(params: {
  tag: string;
  cursor?: string;
  limit: number;
  viewerUserId?: string | null; // ✅ viewer-aware
}) {
  const normalizedTag = params.tag.toLowerCase();
  const viewerUserId = params.viewerUserId ?? null;

  return this.prisma.post.findMany({
    where: {
      // ===== BASE POST FILTER =====
      isDeleted: false,
      isHidden: false,

      // ===== TAG FILTER =====
      tags: {
        some: {
          tag: {
            name: normalizedTag,
          },
        },
      },

      // =================================================
      // 🔐 POST VISIBILITY AUTHORITY (PRODUCTION)
      // =================================================
      AND: [
        {
          OR: [
            // ===== OWNER =====
            ...(viewerUserId
              ? [
                  {
                    authorId: viewerUserId,
                  },
                ]
              : []),

            // ===== PUBLIC =====
            {
              visibility: PostVisibility.PUBLIC,
            },

            // ===== FOLLOWERS =====
            ...(viewerUserId
              ? [
                  {
                    visibility: PostVisibility.FOLLOWERS,
                    author: {
                      followers: {
                        some: {
                          followerId: viewerUserId,
                        },
                      },
                    },
                  },
                ]
              : []),

            // ===== CUSTOM (INCLUDE) =====
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

        // ===== EXCLUDE RULE OVERRIDE (DENY ALWAYS) =====
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

      // ===== BLOCK ENFORCEMENT (2-way, production authority) =====
      ...(viewerUserId
        ? {
            AND: [
              // viewer does NOT block author
              {
                author: {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },
              },

              // author does NOT block viewer
              {
                author: {
                  blockedUsers: {
                    none: {
                      blockedId: viewerUserId,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },

    take: params.limit,
    skip: params.cursor ? 1 : 0,
    cursor: params.cursor ? { id: params.cursor } : undefined,

    orderBy: {
      createdAt: 'desc',
    },

    // ✅ USE SELECT ONLY (mapper-safe, no overfetch)
    select: {
      id: true,
      content: true,
      createdAt: true,

      /** for appeal + ownership */
      isHidden: true,
      isDeleted: true,

      likeCount: true,
      commentCount: true,

      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,

          // ===== privacy (UX only) =====
          isPrivate: true,

          // ===== isFollowing (viewer → author) =====
          followers: viewerUserId
            ? {
                where: {
                  followerId: viewerUserId,
                },
                select: { followerId: true },
                take: 1,
              }
            : false,

          // ===== follow request sent? (viewer → author) =====
          followRequestsReceived: viewerUserId
            ? {
                where: {
                  requesterId: viewerUserId,
                },
                select: { requesterId: true },
                take: 1,
              }
            : false,

          // ===== UX block flag (author blocks viewer?) =====
          blockedBy: viewerUserId
            ? {
                where: {
                  blockerId: viewerUserId,
                },
                select: { blockerId: true },
                take: 1,
              }
            : false,
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
    },
  });
}



async findPublicPosts(params: {
  limit: number;
  cursor?: string;
  mediaType?: "video";
  viewerUserId?: string | null;
}) {
  const viewerUserId = params.viewerUserId ?? null;

  return this.prisma.post.findMany({
    where: {
      // ===== BASE POST FILTER =====
      isDeleted: false,
      isHidden: false,

      // =================================================
      // 🔐 POST VISIBILITY AUTHORITY (PRODUCTION)
      // =================================================
      AND: [
        {
          OR: [
            // ===== OWNER =====
            ...(viewerUserId
              ? [
                  {
                    authorId: viewerUserId,
                  },
                ]
              : []),

            // ===== PUBLIC =====
            {
              visibility: PostVisibility.PUBLIC,
            },

            // ===== FOLLOWERS =====
            ...(viewerUserId
              ? [
                  {
                    visibility: PostVisibility.FOLLOWERS,
                    author: {
                      followers: {
                        some: {
                          followerId: viewerUserId,
                        },
                      },
                    },
                  },
                ]
              : []),

            // ===== CUSTOM (INCLUDE) =====
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

        // ===== EXCLUDE RULE OVERRIDE (DENY ALWAYS) =====
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

      // ===== MEDIA FILTER =====
      ...(params.mediaType === "video"
        ? {
            media: {
              some: {
                media: {
                  mediaType: "VIDEO",
                },
              },
            },
          }
        : {}),

      // ===== BLOCK ENFORCEMENT (2-way, PRODUCTION) =====
      ...(viewerUserId
        ? {
            AND: [
              // viewer must NOT block author
              {
                author: {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },
              },

              // author must NOT block viewer
              {
                author: {
                  blockedUsers: {
                    none: {
                      blockedId: viewerUserId,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },

    orderBy: { createdAt: "desc" },

    take: params.limit,

    ...(params.cursor
      ? { skip: 1, cursor: { id: params.cursor } }
      : {}),

    // ✅ USE SELECT ONLY (mapper-safe)
    select: {
      id: true,
      content: true,
      createdAt: true,

      /** for appeal + ownership */
      isHidden: true,
      isDeleted: true,

      likeCount: true,
      commentCount: true,

      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,

          // ===== privacy (UX only, NOT feed gating) =====
          isPrivate: true,

          // ===== isFollowing (viewer → author) =====
          followers: viewerUserId
            ? {
                where: {
                  followerId: viewerUserId,
                },
                select: { followerId: true },
                take: 1,
              }
            : false,

          // ===== follow request sent? (viewer → author) =====
          followRequestsReceived: viewerUserId
            ? {
                where: {
                  requesterId: viewerUserId,
                },
                select: { requesterId: true },
                take: 1,
              }
            : false,

          // ===== UX block flag (author blocks viewer?) =====
          blockedBy: viewerUserId
            ? {
                where: {
                  blockerId: viewerUserId,
                },
                select: { blockerId: true },
                take: 1,
              }
            : false,
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
    },
  });
}


 
async findPostForLike(params: {
  postId: string;
  viewerUserId?: string | null;
}) {
  const postId = params.postId;
  const viewerUserId = params.viewerUserId ?? null;

  return this.prisma.post.findFirst({
    where: {
      id: postId,

      // ===== BASE POST FILTER =====
      isDeleted: false,
      isHidden: false,

      // =================================================
      // 🔐 LIKE AUTHORITY = POST VISIBILITY AUTHORITY
      // =================================================
      AND: [
        {
          OR: [
            // ===== OWNER =====
            ...(viewerUserId
              ? [
                  {
                    authorId: viewerUserId,
                  },
                ]
              : []),

            // ===== PUBLIC =====
            {
              visibility: PostVisibility.PUBLIC,
            },

            // ===== FOLLOWERS =====
            ...(viewerUserId
              ? [
                  {
                    visibility: PostVisibility.FOLLOWERS,
                    author: {
                      followers: {
                        some: {
                          followerId: viewerUserId,
                        },
                      },
                    },
                  },
                ]
              : []),

            // ===== CUSTOM (INCLUDE) =====
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

        // ===== EXCLUDE RULE OVERRIDE (DENY ALWAYS) =====
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

      // ===== BLOCK ENFORCEMENT (2-way) — KEEP EXACTLY AS IS =====
      ...(viewerUserId
        ? {
            AND: [
              {
                author: {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },
              },
              {
                author: {
                  blockedUsers: {
                    none: {
                      blockedId: viewerUserId,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },

    select: {
      id: true,
      authorId: true,
      isDeleted: true,
      isHidden: true,
    },
  });
}





  async toggleLike(params: {
    postId: string;
    userId: string;
  }): Promise<{ liked: boolean; likeCount: number }> {
    const { postId, userId } = params;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existing) {
        await tx.postLike.delete({
          where: {
            id: existing.id,
          },
        });

        const post = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        });

        return {
          liked: false,
          likeCount: post.likeCount,
        };
      }

      await tx.postLike.create({
        data: {
          postId,
          userId,
        },
      });

      const post = await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });

      return {
        liked: true,
        likeCount: post.likeCount,
      };
    });
  }

  async unlike(params: {
    postId: string;
    userId: string;
  }): Promise<{ liked: false; likeCount: number }> {
    const { postId, userId } = params;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      // 👉 idempotent: ไม่เคย like มาก่อน
      if (!existing) {
        const post = await tx.post.findUnique({
          where: { id: postId },
          select: { likeCount: true },
        });

        return {
          liked: false,
          likeCount: post?.likeCount ?? 0,
        };
      }

      await tx.postLike.delete({
        where: { id: existing.id },
      });

      const post = await tx.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
        select: { likeCount: true },
      });

      return {
        liked: false,
        likeCount: post.likeCount,
      };
    });
  }

   async existsPost(postId: string): Promise<boolean> {
    const count = await this.prisma.post.count({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,
      },
    });

    return count > 0;
  }

 async findLikesByPostId(params: {
  postId: string;
  cursor?: string;
  limit: number;
  viewerUserId?: string | null;
}): Promise<{
  rows: Array<{
    createdAt: Date;
    user: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }>;
  nextCursor: string | null;
}> {
  const { postId, cursor, limit, viewerUserId } = params;

  const rows = await this.prisma.postLike.findMany({
    where: {
      postId,

      // ===== POST VISIBILITY (PRIVATE FLOW) =====
      post: {
        isDeleted: false,

        OR: [
          // public author
          {
            author: {
              isPrivate: false,
            },
          },

          ...(viewerUserId
            ? [
                // owner
                {
                  authorId: viewerUserId,
                },

                // approved follower
                {
                  author: {
                    followers: {
                      some: {
                        followerId: viewerUserId,
                      },
                    },
                  },
                },
              ]
            : []),
        ],

        // ===== BLOCK ENFORCEMENT (viewer ↔ author) =====
        ...(viewerUserId
          ? {
              AND: [
                // viewer must NOT block author
                {
                  author: {
                    blockedBy: {
                      none: {
                        blockerId: viewerUserId,
                      },
                    },
                  },
                },

                // author must NOT block viewer
                {
                  author: {
                    blockedUsers: {
                      none: {
                        blockedId: viewerUserId,
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },

      // ===== BLOCK FILTER (viewer ↔ liker) =====
      ...(viewerUserId
        ? {
            user: {
              AND: [
                // viewer does NOT block user
                {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },

                // user does NOT block viewer
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

    take: limit + 1,

    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),

    orderBy: { createdAt: 'desc' },

    select: {
      id: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (rows.length > limit) {
    const next = rows.pop();
    nextCursor = next!.id;
  }

  return { rows, nextCursor };
}

async findPostVisibilityRules(params: { postId: string }) {
  const { postId } = params;

  return this.prisma.postVisibilityRule.findMany({
    where: { postId },
    select: {
      userId: true,
      rule: true,
    },
  });
}

}
