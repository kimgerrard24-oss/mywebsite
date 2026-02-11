// backend/src/profile/policy/profile-media.policy.ts
import {
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Media, MediaType } from '@prisma/client';
import { ProfileMediaAccessErrorCode } from '../profile-media.error-codes';

/* ============================================================
   Types
============================================================ */

export interface ProfileMediaPolicyContext {
  userExists: boolean;
  isOwner: boolean;
  isPrivate: boolean;
  isFollower: boolean;
  isBlocked: boolean;
  isBanned: boolean;
  isActive: boolean;
}

export interface ProfileMediaPolicyDecision {
  canView: boolean;
  reason?: ProfileMediaAccessErrorCode;
}



/* ============================================================
   Policy Class (Single Authority)
============================================================ */

export class ProfileMediaPolicy {
  /* ========================================================
     SET AVATAR (legacy usage)
  ======================================================== */

  static assertCanSetAvatar(params: {
    mediaOwnerId: string;
    actorUserId: string;
    mediaType: MediaType;
    deletedAt: Date | null;
  }) {
    const { mediaOwnerId, actorUserId, mediaType, deletedAt } = params;

    if (deletedAt) {
      throw new BadRequestException('Media already deleted');
    }

    if (mediaOwnerId !== actorUserId) {
      throw new ForbiddenException('You do not own this media');
    }

    if (mediaType !== MediaType.IMAGE) {
      throw new BadRequestException('Avatar must be an image');
    }
  }

  /* ========================================================
     SET COVER / GENERIC PROFILE MEDIA
  ======================================================== */

  static assertCanSetProfileMedia(params: {
    actorUserId: string;
    media: Media | null;
  }) {
    const { actorUserId, media } = params;

    if (!media) {
      throw new BadRequestException('Media not found');
    }

    if (media.deletedAt) {
      throw new BadRequestException('Media already deleted');
    }

    if (media.ownerUserId !== actorUserId) {
      throw new ForbiddenException('You do not own this media');
    }

    if (media.mediaType !== MediaType.IMAGE) {
      throw new BadRequestException('Profile media must be an image');
    }
  }

  /* ========================================================
     SET CURRENT (history switching)
  ======================================================== */

  static assertCanSetCurrent(reason: string | null) {
    if (!reason) return;

    switch (reason) {
      case 'NOT_FOUND':
        throw new BadRequestException('Media not found');

      case 'NOT_OWNER':
        throw new ForbiddenException('You do not own this media');

      case 'DELETED':
        throw new BadRequestException('Media deleted');

      case 'INVALID_TYPE':
        throw new BadRequestException('Only image allowed');

      default:
        throw new ForbiddenException('Forbidden');
    }
  }

  /* ========================================================
     VIEW PROFILE MEDIA (grid list)
  ======================================================== */

 static decide(
  ctx: ProfileMediaPolicyContext,
): ProfileMediaPolicyDecision {
  if (!ctx.userExists) {
    return {
      canView: false,
      reason: ProfileMediaAccessErrorCode.NOT_FOUND,
    };
  }

  if (ctx.isBanned || !ctx.isActive) {
    return {
      canView: false,
      reason: ProfileMediaAccessErrorCode.USER_INACTIVE,
    };
  }

  if (ctx.isBlocked) {
    return {
      canView: false,
      reason: ProfileMediaAccessErrorCode.BLOCKED,
    };
  }

  if (ctx.isOwner) {
    return { canView: true };
  }

  if (ctx.isPrivate && !ctx.isFollower) {
    return {
      canView: false,
      reason: ProfileMediaAccessErrorCode.PRIVATE_ACCOUNT,
    };
  }

  return { canView: true };
}


  /* ========================================================
     VIEW CURRENT PROFILE MEDIA (avatar + cover)
  ======================================================== */

  static decideCurrentProfileMedia(params: {
    userExists: boolean;
    isOwner: boolean;
    isPrivate: boolean;
    isFollower: boolean;
    isBlocked: boolean;
    isBanned: boolean;
    isActive: boolean;
  }): ProfileMediaPolicyDecision {
    const {
      userExists,
      isOwner,
      isPrivate,
      isFollower,
      isBlocked,
      isBanned,
      isActive,
    } = params;

    if (!userExists) {
      return {
        canView: false,
        reason: ProfileMediaAccessErrorCode.NOT_FOUND,
      };
    }

    if (isBanned) {
      return {
        canView: false,
        reason: ProfileMediaAccessErrorCode.USER_BANNED,
      };
    }

    if (!isActive) {
      return {
        canView: false,
        reason: ProfileMediaAccessErrorCode.USER_INACTIVE,
      };
    }

    if (isBlocked) {
      return {
        canView: false,
        reason: ProfileMediaAccessErrorCode.BLOCKED,
      };
    }

    if (isOwner) {
      return { canView: true };
    }

    if (isPrivate && !isFollower) {
      return {
        canView: false,
        reason: ProfileMediaAccessErrorCode.PRIVATE_ACCOUNT,
      };
    }

    return { canView: true };
  }
}



