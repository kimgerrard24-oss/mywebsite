// backend/src/profile-update/cover-update.service.ts

import { Injectable } from '@nestjs/common';
import { ProfileMediaType, PostVisibility } from '@prisma/client';
import { CoverUpdateRepository } from './cover-update.repository';
import { CoverUpdateTransaction } from './cover-update.transaction';
import { ProfileMediaRepository } from '../profile/profile-media.repository';
import { validateCoverContent } from './validation/cover-update.validation';
import { CoverUpdatePolicy } from './policy/cover-update.policy';
import { CoverUpdateDraftNotFoundError } from './errors/cover-update.errors';
import { AuditLogService } from '../users/audit/audit-log.service';
import { CreateCoverUpdateDto } from './dto/create-cover-update.dto';
import { PublishCoverUpdateDto } from './dto/publish-cover-update.dto';

@Injectable()
export class CoverUpdateService {
  constructor(
    private readonly repo: CoverUpdateRepository,
    private readonly tx: CoverUpdateTransaction,
    private readonly mediaRepo: ProfileMediaRepository,
    private readonly audit: AuditLogService,
  ) {}

  async createOrUpdateDraft(
    userId: string,
    dto: CreateCoverUpdateDto,
  ) {
    validateCoverContent(dto.content);

    const media = await this.mediaRepo.findOwnedMedia(
      dto.mediaId,
      userId,
    );

    CoverUpdatePolicy.assertValidMedia(media, userId);

    return this.repo.upsertDraft({
      userId,
      type: ProfileMediaType.COVER,
      mediaId: dto.mediaId,
      content: dto.content,
      visibility: dto.visibility ?? PostVisibility.PUBLIC,
    });
  }

  async publish(userId: string, dto: PublishCoverUpdateDto) {
  const draft = await this.repo.findDraft(userId);
  if (!draft) {
    throw new CoverUpdateDraftNotFoundError();
  }

  const post = await this.tx.publish({
    userId,
    draft,
    notifyFollowers: dto.notifyFollowers ?? false,
  });

  await this.audit.log({
    userId,
    action: 'COVER_UPDATE_PUBLISHED',
    success: true,
    targetId: post.id,
  });

  return { postId: post.id };
}

}

