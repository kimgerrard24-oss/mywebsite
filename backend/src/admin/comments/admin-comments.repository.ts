// backend/src/admin/comments/admin-comments.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeleteSource } from '@prisma/client';

@Injectable()
export class AdminCommentsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findById(commentId: string) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
      },
    });
  }

  softDelete(params: {
    commentId: string;
    reason?: string;
    adminId: string;
  }) {
    const { commentId, reason, adminId } = params;

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: adminId,
        deletedSource: DeleteSource.ADMIN,
        deleteReason: reason ?? null,
      },
    });
  }
}
