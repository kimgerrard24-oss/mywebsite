// backend/src/profile/profile-media.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileMediaRepository } from './profile-media.repository';
import { ProfileMediaPolicy } from './policy/profile-media.policy';
import { AuditLogService } from '../users/audit/audit-log.service';
import { R2Service } from '../r2/r2.service';
import {
  ProfileMediaResponseDto,
} from "./dto/profile-media.response.dto";
import {
  ProfileMediaAccessDeniedError,
  ProfileMediaNotFoundError,
} from "./profile-media.errors";
import { ProfileMediaMapper } from "./mapper/profile-media.mapper";
import { GetProfileMediaQueryDto } from "./dto/get-profile-media.query.dto";
import { SetCurrentProfileMediaParams } from './types/profile-media.types';
import { assertValidProfileMedia } from './profile-media.validation';
import { GetCurrentProfileMediaResponseDto } from './dto/get-current-profile-media.response.dto';
import { ProfileMediaAccessErrorCode } from './profile-media.error-codes';
import { PostsService } from '../posts/posts.service';
import { PostVisibility, PostType } from '@prisma/client';
import { PostsVisibilityService } from '../posts/visibility/posts-visibility.service';
import { ProfileMediaDeleteErrorCode } from './profile-media.error-codes';
import { ProfileMediaDeletePolicy } from './policy/profile-media-delete.policy';
import {
  ProfileMediaDeleteAccessDeniedError,
  ProfileMediaDeleteNotFoundError,
} from './profile-media-delete.errors';
import { CreateProfileMediaDto } from './dto/create-profile-media.dto';

@Injectable()
export class ProfileMediaService {
  constructor(
    private readonly repo: ProfileMediaRepository,
    private readonly audit: AuditLogService,
    private readonly r2: R2Service,
    private readonly postsService: PostsService,
    private readonly postsVisibility: PostsVisibilityService,
  ) {}

  async setAvatar(actorUserId: string, mediaId: string) {
    const media = await this.repo.findOwnedMedia(
  mediaId,
  actorUserId,
);


if (!media) {
  throw new ProfileMediaNotFoundError();
}

    ProfileMediaPolicy.assertCanSetAvatar({
      mediaOwnerId: media.ownerUserId,
      actorUserId,
      mediaType: media.mediaType,
      deletedAt: media.deletedAt,
    });

    if (media.mediaCategory !== 'AVATAR') {
  throw new ProfileMediaAccessDeniedError(
    ProfileMediaAccessErrorCode.INVALID_MEDIA_CATEGORY,
  );
}

    const user = await this.repo.setAvatarTransaction({
      userId: actorUserId,
      mediaId,
    });

    try {
  await this.postsService.deletePreviousProfileUpdatePosts({
    userId: actorUserId,
    type: PostType.PROFILE_UPDATE,
  });
} catch {}


   try {
  await this.postsService.createPost({
    authorId: actorUserId,
    typeOverride: PostType.PROFILE_UPDATE,
    dto: {
      content: '',
      mediaIds: [mediaId],
      visibility: PostVisibility.PUBLIC,
    },
  });
} catch {
  // ❗ profile update must never fail because post creation failed
}

    const avatarUrl = this.r2.buildPublicUrl(
      user.avatarMedia?.objectKey!,
    );

    await this.audit.log({
      userId: actorUserId,
      action: 'USER_AVATAR_UPDATED',
      success: true,
      targetId: mediaId,
    });

    return {
      avatarUrl,
      mediaId,
    };
  }

   async setCover(params: {
    actorUserId: string;
    mediaId: string;
  }) {
    const { actorUserId, mediaId } = params;

const media = await this.repo.findOwnedMedia(
  mediaId,
  actorUserId,
);


if (!media) {
  throw new ProfileMediaNotFoundError();
}

ProfileMediaPolicy.assertCanSetProfileMedia({
  actorUserId,
  media,
});

if (media.mediaCategory !== 'COVER') {
  throw new ProfileMediaAccessDeniedError(
    ProfileMediaAccessErrorCode.INVALID_MEDIA_CATEGORY,
  );
}

    const result = await this.repo.setCover({
      userId: actorUserId,
      mediaId,
    });

    try {
  await this.postsService.deletePreviousProfileUpdatePosts({
    userId: actorUserId,
    type: PostType.COVER_UPDATE,
  });
} catch {}


    try {
  await this.postsService.createPost({
    authorId: actorUserId,
    typeOverride: PostType.COVER_UPDATE,
    dto: {
      content: '',
      mediaIds: [mediaId],
      visibility: PostVisibility.PUBLIC,
    },
  });
} catch {
  // ❗ profile update must never fail because post creation failed
}



    // Audit (fail-soft)
    try {
      await this.audit.log({
        userId: actorUserId,
        action: 'PROFILE_COVER_UPDATED',
        success: true,
        targetId: mediaId,
      });
    } catch {}

    return {
      coverUrl:
        this.r2.buildPublicUrl(media.objectKey),
    };
  }

   async getProfileMedia(
    viewerId: string | null,
    targetUserId: string,
    query: GetProfileMediaQueryDto,
  ): Promise<ProfileMediaResponseDto> {
    const user = await this.repo.findUserWithRelations(targetUserId);

    const isOwner = viewerId === targetUserId;

    const isBlocked =
      viewerId &&
      (await this.repo.checkBlockRelation(viewerId, targetUserId));

    const isFollower =
      viewerId &&
      (await this.repo.checkFollower(viewerId, targetUserId));

    const decision = ProfileMediaPolicy.decide({
      userExists: Boolean(user),
      isOwner,
      isPrivate: user?.isPrivate ?? false,
      isFollower: Boolean(isFollower),
      isBlocked: Boolean(isBlocked),
      isBanned: user?.isBanned ?? false,
      isActive: user?.active ?? false,
    });

    if (!decision.canView) {
      if (decision.reason === "NOT_FOUND") {
        throw new ProfileMediaNotFoundError();
      }

      throw new ProfileMediaAccessDeniedError(decision.reason!);
    }

    const media = await this.repo.findProfileMedia({
      userId: targetUserId,
      type: query.type,
      cursor: query.cursor,
      limit: query.limit ?? 20,
    });

    const hasNext = media.length > (query.limit ?? 20);
    const items = hasNext ? media.slice(0, -1) : media;

   /* =========================================================
   🔒 POST VISIBILITY GUARD (AUTHORITATIVE)
========================================================= */

const mappedItems = await Promise.all(
  items.map(async (m) => {
    const dto = ProfileMediaMapper.toDto(m, this.r2);

    // ถ้าไม่มี postId → return ปกติ
    if (!dto.postId) {
      return dto;
    }

    try {
      const decision =
        await this.postsVisibility.validateVisibility({
          postId: dto.postId,
          viewerUserId: viewerId,
        });

      if (!decision.canView) {
        return {
          ...dto,
          postId: null, // 🔒 strip post
        };
      }

      return dto;
    } catch {
      return {
        ...dto,
        postId: null,
      };
    }
  }),
);

return {
  items: mappedItems,
  nextCursor: hasNext
    ? items[items.length - 1].id
    : null,
};
  }

   async setCurrentProfileMedia(params: SetCurrentProfileMediaParams) {
    const { actorUserId, mediaId, type } = params;

    const media = await this.repo.findMediaById(mediaId);
    
    const reason = assertValidProfileMedia(media, actorUserId);

    if (reason === 'NOT_FOUND') {
      throw new ProfileMediaNotFoundError();
    }

    ProfileMediaPolicy.assertCanSetCurrent(reason);

if (!media || media.mediaCategory !== type) {
  throw new ProfileMediaAccessDeniedError(
    ProfileMediaAccessErrorCode.INVALID_MEDIA_CATEGORY,
  );
}

    const updated = await this.repo.setCurrentProfileMedia({
      userId: actorUserId,
      mediaId,
      type,
    });

    await this.audit.log({
      userId: actorUserId,
      action: 'PROFILE_MEDIA_SET_CURRENT',
      success: true,
      targetId: mediaId,
    });

    return {
      url: this.r2.buildPublicUrl(updated!.objectKey),
      mediaId,
      type,
    };
  }

  async getCurrentProfileMedia(
  viewerId: string | null,
  targetUserId: string,
): Promise<GetCurrentProfileMediaResponseDto> {

  const user = await this.repo.findUserWithCurrentMedia(targetUserId);

  if (!user) {
    throw new ProfileMediaNotFoundError();
  }

  const isBlocked =
    viewerId &&
    (await this.repo.checkBlockRelation(viewerId, targetUserId));

  if (isBlocked) {
    throw new ProfileMediaAccessDeniedError(
      ProfileMediaAccessErrorCode.BLOCKED,
    );
  }

  return {
  avatar:
    user?.avatarMedia && !user.avatarMedia.deletedAt
      ? ProfileMediaMapper.toCurrentDto(user.avatarMedia, this.r2)
      : null,

  cover:
    user?.coverMedia && !user.coverMedia.deletedAt
      ? ProfileMediaMapper.toCurrentDto(user.coverMedia, this.r2)
      : null,
};

}

 async deleteProfileMedia(params: {
    actorUserId: string;
    mediaId: string;
  }) {
    const { actorUserId, mediaId } = params;

    const context = await this.repo.loadDeleteContext(
      mediaId,
      actorUserId,
    );

    if (!context) {
      throw new ProfileMediaNotFoundError();
    }

    const decision = ProfileMediaDeletePolicy.decide({
      mediaExists: Boolean(context.media),
      isOwner: context.isOwner,
      isBlocked: context.isBlocked,
      isDeleted: Boolean(context.media.deletedAt),
    });

   if (!decision.allowed) {
  if (decision.reason === 'NOT_FOUND') {
    throw new ProfileMediaDeleteNotFoundError();
  }

  throw new ProfileMediaDeleteAccessDeniedError(
    ProfileMediaDeleteErrorCode[
      decision.reason as keyof typeof ProfileMediaDeleteErrorCode
    ],
  );
}


    await this.repo.deleteProfileMediaAtomic({
      mediaId,
      userId: actorUserId,
    });

    await this.audit.log({
      userId: actorUserId,
      action: 'PROFILE_MEDIA_DELETED',
      success: true,
      targetId: mediaId,
    }).catch(() => {});

    return { success: true };
  }

async createProfileMedia(params: {
  actorUserId: string;
  dto: CreateProfileMediaDto;
}) {

  const { actorUserId, dto } = params;

  /**
   * =====================================================
   * 1️⃣ Create Media row (authoritative)
   * =====================================================
   */
  let media;

  if (dto.setAsCurrent) {

    media =
      await this.repo.createAndSetCurrentProfileMediaAtomic({
        userId: actorUserId,
        objectKey: dto.objectKey,
        type: dto.type,
        caption: dto.caption ?? null,
      });

  } else {

    media =
      await this.repo.createProfileMedia({
        userId: actorUserId,
        objectKey: dto.objectKey,
        type: dto.type,
        caption: dto.caption ?? null,
      });

  }

  /**
   * =====================================================
   * 2️⃣ Optional: create PROFILE_UPDATE / COVER_UPDATE post
   * =====================================================
   */
  try {

    const post = await this.postsService.createPost({

      authorId: actorUserId,

      typeOverride:
        dto.type === "AVATAR"
          ? PostType.PROFILE_UPDATE
          : PostType.COVER_UPDATE,

      dto: {
        content: dto.caption ?? "",
        mediaIds: [media.id],
        visibility: PostVisibility.PUBLIC,
      },

    });

    await this.repo.attachProfilePost(
      media.id,
      post.id,
    );

  } catch {
    /**
     * Fail-soft
     * profile media must never fail because post failed
     */
  }

  /**
   * =====================================================
   * 3️⃣ Return authoritative response
   * =====================================================
   */
  return {

    mediaId: media.id,

    url: this.r2.buildPublicUrl(
      media.objectKey,
    ),

    type: media.mediaCategory,

    caption: media.caption ?? null,

  };

}

}
