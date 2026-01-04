// backend/src/comments/comments.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findPostForComment(postId: string) {
    return this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,
        isPublished: true,
      },
      select: {
        id: true,
        authorId: true,
      },
    });
  }

  async createComment(params: {
    postId: string;
    authorId: string;
    content: string;
  }) {
    const { postId, authorId, content } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          postId,
          authorId,
          content,
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: { increment: 1 },
        },
      });

      return comment;
    });
  }

  async findReadablePost(postId: string) {
    return this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,
        isPublished: true,
      },
      select: { id: true },
    });
  }

  async findComments(params: {
    postId: string;
    limit: number;
    cursor?: string;
  }) {
    const { postId, limit, cursor } = params;

    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });
  }

  async findById(commentId: string) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
      },
    });
  }

  async updateContent(params: {
  commentId: string;
  content: string;
}) {
  return this.prisma.comment.update({
    where: { id: params.commentId },
    data: {
      content: params.content,
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


   async deleteById(commentId: string) {
  await this.prisma.comment.update({
    where: { id: commentId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
}

  

 async findByPostId(params: {
  postId: string;
  limit: number;
  cursor?: string;
}) {
  const { postId, limit, cursor } = params;

  return this.prisma.comment.findMany({
    where: {
      postId,
      isDeleted: false,
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

      likes: {
        select: {
          userId: true, 
        },
      },

      _count: {
        select: {
          likes: true, 
        },
      },
    },
  });
 }

 // =========================
  // 🔹 CREATE COMMENT MENTIONS
  // =========================
  async createCommentMentions(params: {
    commentId: string;
    userIds: string[];
  }): Promise<void> {
    const { commentId, userIds } = params;

    if (userIds.length === 0) return;

    /**
     * Use createMany for efficiency
     * skipDuplicates ป้องกัน unique constraint error
     */
    await this.prisma.commentMention.createMany({
      data: userIds.map((userId) => ({
        commentId,
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
