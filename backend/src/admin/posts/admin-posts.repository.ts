// backend/src/admin/posts/admin-posts.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeleteSource } from '@prisma/client';

@Injectable()
export class AdminPostsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findById(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
      },
    });
  }

  softDelete(params: {
    postId: string;
    reason: string;
  }) {
    const { postId, reason } = params;

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedSource: DeleteSource.ADMIN,
        deleteReason: reason,
      },
    });
  }

   async findPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  }
}
