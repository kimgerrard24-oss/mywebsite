import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicUserById(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        isDisabled: false,
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });
  }
}
