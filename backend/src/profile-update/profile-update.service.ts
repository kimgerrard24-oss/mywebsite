// backend/src/profile-update/profile-update.service.ts

import { Injectable } from '@nestjs/common';
import { ProfileUpdateRepository } from './profile-update.repository';
import { ProfileUpdateTransaction } from './profile-update.transaction';
import { validateDraftContent } from './validation/profile-update.validation';
import { AuditLogService } from '../users/audit/audit-log.service';

@Injectable()
export class ProfileUpdateService {
  constructor(
    private readonly repo: ProfileUpdateRepository,
    private readonly tx: ProfileUpdateTransaction,
    private readonly audit: AuditLogService,
  ) {}

  async createOrUpdateDraft(userId: string, dto: any) {
    validateDraftContent(dto.content);

    const draft = await this.repo.upsertDraft({
      userId,
      type: dto.type,
      mediaId: dto.mediaId,
      content: dto.content,
      visibility: dto.visibility ?? 'PUBLIC',
    });

    return draft;
  }

  async publish(userId: string, dto: any) {
    const draft = await this.repo.findDraft(userId, dto.type);
    if (!draft) {
      throw new Error('DRAFT_NOT_FOUND');
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
