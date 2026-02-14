// backend/src/profile-update/cover-update.service.ts

import { Injectable } from '@nestjs/common';
import {
  ProfileMediaType,
  PostVisibility,
} from '@prisma/client';

import { CoverUpdateRepository } from './cover-update.repository';
import { CoverUpdateTransaction } from './cover-update.transaction';
import { ProfileMediaRepository } from '../profile/profile-media.repository';
import { validateCoverUpdateContent } from './validation/cover-update.validation';
import { CoverUpdateDraftNotFoundError } from './errors/cover-update.errors';
import { AuditLogService } from '../users/audit/audit-log.service';
import { CreateCoverUpdateDto } from './dto/create-cover-update.dto';

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
    validateCoverUpdateContent(dto.content);

    const media = await this.mediaRepo.findOwnedMedia(
      dto.mediaId,
      userId,
    );

    if (!media) {
      throw new Error('MEDIA_NOT_FOUND_OR_NOT_OWNED');
    }

    return this.repo.upsertDraft({
      userId,
      type: ProfileMediaType.COVER, // 🔥 สำคัญ
      mediaId: dto.mediaId,
      content: dto.content,
      visibility: dto.visibility ?? PostVisibility.PUBLIC,
    });
  }

  async publish(userId: string) {
    const draft = await this.repo.findDraft(
      userId,
      ProfileMediaType.COVER,
    );

    if (!draft) {
      throw new CoverUpdateDraftNotFoundError();
    }

    const post = await this.tx.publish({
      userId,
      draft,
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


