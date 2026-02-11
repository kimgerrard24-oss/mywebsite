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

@Injectable()
export class ProfileMediaService {
  constructor(
    private readonly repo: ProfileMediaRepository,
    private readonly audit: AuditLogService,
    private readonly r2: R2Service,
  ) {}

  async setAvatar(actorUserId: string, mediaId: string) {
    const media = await this.repo.findOwnedMedia(mediaId);

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    ProfileMediaPolicy.assertCanSetAvatar({
      mediaOwnerId: media.ownerUserId,
      actorUserId,
      mediaType: media.mediaType,
      deletedAt: media.deletedAt,
    });

    const user = await this.repo.setAvatarTransaction({
      userId: actorUserId,
      mediaId,
    });

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

    const media =
      await this.repo.findMediaById(mediaId);

    ProfileMediaPolicy.assertCanSetProfileMedia({
      actorUserId,
      media,
    });

    if (!media) {
      throw new NotFoundException();
    }

    const result = await this.repo.setCover({
      userId: actorUserId,
      mediaId,
    });

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

   return {
  items: items.map((m) =>
    ProfileMediaMapper.toDto(m, this.r2),
  ),
  nextCursor: hasNext ? items[items.length - 1].id : null,
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

    const isOwner = viewerId === targetUserId;

    const isFollower =
      viewerId &&
      (await this.repo.checkFollower(viewerId, targetUserId));

    const isBlocked =
      viewerId &&
      (await this.repo.checkBlockRelation(viewerId, targetUserId));

    const decision = ProfileMediaPolicy.decideCurrentProfileMedia({
      userExists: Boolean(user),
      isOwner,
      isPrivate: user?.isPrivate ?? false,
      isFollower: Boolean(isFollower),
      isBlocked: Boolean(isBlocked),
      isBanned: user?.isBanned ?? false,
      isActive: user?.active ?? false,
    });

    if (!decision.canView) {
      if (decision.reason === 'NOT_FOUND') {
        throw new ProfileMediaNotFoundError();
      }

      throw new ProfileMediaAccessDeniedError(decision.reason!);
    }

    return {
      avatar: user?.avatarMedia
        ? ProfileMediaMapper.toCurrentDto(user.avatarMedia, this.r2)
        : null,
      cover: user?.coverMedia
        ? ProfileMediaMapper.toCurrentDto(user.coverMedia, this.r2)
        : null,
    };
  }
}
