// backend/src/profile-update/profile-update.service.ts

import { Injectable } from '@nestjs/common';
import { ProfileUpdateRepository } from './profile-update.repository';
import { ProfileUpdateTransaction } from './profile-update.transaction';
import { validateProfileUpdateContent } from './validation/profile-update.validation';
import { AuditLogService } from '../users/audit/audit-log.service';
import { ProfileMediaRepository } from '../profile/profile-media.repository';
import { ProfileUpdateDraftNotFoundError } from './errors/profile-update.errors';
import {
  ProfileMediaType,
  PostVisibility,
} from '@prisma/client';
import { CreateProfileUpdateDto } from './dto/create-profile-update.dto';
import { PublishProfileUpdateDto } from './dto/publish-profile-update.dto';

@Injectable()
export class ProfileUpdateService {
  constructor(
    private readonly repo: ProfileUpdateRepository,
    private readonly tx: ProfileUpdateTransaction,
    private readonly mediaRepo: ProfileMediaRepository,
    private readonly audit: AuditLogService,
  ) {}

 async createOrUpdateDraft(
  userId: string,
  dto: CreateProfileUpdateDto,
) {
  validateProfileUpdateContent(dto.content);

  const media = await this.mediaRepo.findOwnedMedia(
    dto.mediaId,
    userId,
  );

  if (!media) {
    throw new Error('MEDIA_NOT_FOUND_OR_NOT_OWNED');
  }

  return this.repo.upsertDraft({
    userId,
    type: ProfileMediaType.AVATAR, 
    mediaId: dto.mediaId,
    content: dto.content,
    visibility: dto.visibility ?? PostVisibility.PUBLIC,
  });
}


  async publish(userId: string) {
  const draft = await this.repo.findDraft(
    userId,
    ProfileMediaType.AVATAR,
  );

  if (!draft) {
    throw new ProfileUpdateDraftNotFoundError();
  }

  const post = await this.tx.publish({
    userId,
    draft,
  });

  await this.audit.log({
    userId,
    action: 'PROFILE_UPDATE_PUBLISHED',
    success: true,
    targetId: post.id,
  });

  return { postId: post.id };
}

}

