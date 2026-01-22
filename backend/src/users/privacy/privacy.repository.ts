// backend/src/users/privacy/privacy.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrivacyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserForPrivacyUpdate(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isPrivate: true,
        isDisabled: true,
        isBanned: true,
        isAccountLocked: true,
      },
    });
  }

  async updatePostPrivacy(userId: string, isPrivate: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isPrivate },
      select: {
        id: true,
        isPrivate: true,
        updatedAt: true,
      },
    });
  }
}

