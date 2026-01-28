// backend/src/shares/shares-external.service.ts

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { SharesExternalRepository } from './shares-external.repository';
import { ShareExternalPolicy } from './policy/share-external.policy';
import { generateShareCode } from './utils/share-code.generator';

@Injectable()
export class SharesExternalService {
  constructor(
    private readonly repo: SharesExternalRepository,
  ) {}

  /**
   * FINAL AUTHORITY:
   * Service → Repository(load) → Policy → DB commit
   */
  async createExternalShare(params: {
  actorUserId: string;
  postId: string;
}) {
  const ctx = await this.repo.loadContext(params);

  const decision =
    ShareExternalPolicy.decide(ctx as any);

  if (decision === 'NOT_FOUND') {
    throw new NotFoundException('Post not found');
  }

  if (decision !== 'OK') {
    throw new ForbiddenException(
      'Cannot share externally',
    );
  }

  const base =
    process.env.PUBLIC_WEB_BASE_URL ??
    'https://www.phlyphant.com';

  // =========================
  // Reuse existing link
  // =========================
  const existing =
    await this.repo.findExistingLink({
      postId: params.postId,
      creatorUserId: params.actorUserId,
    });

  if (existing) {
    return {
      id: existing.id,
      code: existing.code,
      url: `${base}/s/${existing.code}`,
      createdAt: existing.createdAt.toISOString(),
    };
  }

  // =========================
  // Create new link
  // =========================
  const code = generateShareCode();

  const row =
    await this.repo.createShareLink({
      postId: params.postId,
      creatorUserId: params.actorUserId,
      code,
    });

  return {
    id: row.id,
    code: row.code,
    url: `${base}/s/${row.code}`,
    createdAt: row.createdAt.toISOString(),
  };
}

}
