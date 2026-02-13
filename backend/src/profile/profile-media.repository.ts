// backend/src/profile/profile-media.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileMediaType } from "@prisma/client";

@Injectable()
export class ProfileMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOwnedMedia(mediaId: string, ownerUserId: string) {
  return this.prisma.media.findFirst({
    where: {
      id: mediaId,
      ownerUserId,
      deletedAt: null,
    },
  });
}


  async setAvatarTransaction(params: {
    userId: string;
    mediaId: string;
  }) {
    const { userId, mediaId } = params;

    return this.prisma.$transaction(async (tx) => {

  // unset previous avatar
  await tx.media.updateMany({
    where: {
      ownerUserId: userId,
      profileType: 'AVATAR',
    },
    data: {
      profileType: null,
    },
  });

  // set new avatar
  await tx.media.update({
    where: { id: mediaId },
    data: { profileType: 'AVATAR' },
  });

  const user = await tx.user.update({
    where: { id: userId },
    data: { avatarMediaId: mediaId },
    include: { avatarMedia: true },
  });

  return user;
});
  
}

  async setCover(params: {
  userId: string;
  mediaId: string;
}) {
  const { userId, mediaId } = params;

  return this.prisma.$transaction(async (tx) => {
    await tx.media.updateMany({
  where: {
    ownerUserId: userId,
    profileType: 'COVER',
  },
  data: {
    profileType: null,
  },
});

await tx.media.update({
  where: { id: mediaId },
  data: { profileType: 'COVER' },
});


    const user = await tx.user.update({
      where: { id: userId },
      data: {
        coverMediaId: mediaId, 
      },
      include: {
        coverMedia: true,
      },
    });

    return user;
  });
}


   async findUserWithRelations(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isPrivate: true,
        isBanned: true,
        active: true,
      },
    });
  }

  async checkBlockRelation(viewerId: string, targetUserId: string) {
    if (!viewerId) return false;

    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: viewerId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: viewerId },
        ],
      },
    });

    return Boolean(block);
  }

  async checkFollower(viewerId: string, targetUserId: string) {
    if (!viewerId) return false;

    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: targetUserId,
        },
      },
    });

    return Boolean(follow);
  }

  async findProfileMedia(params: {
    userId: string;
    type?: ProfileMediaType;
    cursor?: string;
    limit: number;
  }) {
    const { userId, type, cursor, limit } = params;

    return this.prisma.media.findMany({
      where: {
  ownerUserId: userId,
  deletedAt: null,
  ...(type && { mediaCategory: type }),
},

      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  }

  async findMediaById(mediaId: string) {
    return this.prisma.media.findUnique({
      where: { id: mediaId },
    });
  }

  async setCurrentProfileMedia(params: {
    userId: string;
    mediaId: string;
    type: ProfileMediaType;
  }) {
    const { userId, mediaId, type } = params;

    return this.prisma.$transaction(async (tx) => {
      // unset previous
      await tx.media.updateMany({
        where: {
          ownerUserId: userId,
          profileType: type,
        },
        data: {
          profileType: null,
        },
      });

      // set new
      await tx.media.update({
        where: { id: mediaId },
        data: {
          profileType: type,
        },
      });

      if (type === 'AVATAR') {
        await tx.user.update({
          where: { id: userId },
          data: { avatarMediaId: mediaId },
        });
      }

      if (type === 'COVER') {
        await tx.user.update({
          where: { id: userId },
          data: { coverMediaId: mediaId },
        });
      }

      return tx.media.findUnique({
        where: { id: mediaId },
      });
    });
  }

  
  async findUserWithCurrentMedia(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatarMedia: true,
        coverMedia: true,
      },
    });
  }


}
