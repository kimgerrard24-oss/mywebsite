// backend/src/shares/shares-intent.service.ts

import { Injectable } from '@nestjs/common';

import { SharesIntentRepository } from './shares-intent.repository';
import { ShareIntentPolicy } from './policy/share-intent.policy';

@Injectable()
export class SharesIntentService {
  constructor(
    private readonly repo: SharesIntentRepository,
  ) {}

  /**
   * FINAL AUTHORITY:
   * Service → Repository(load context) → Policy(decide)
   */
  async checkIntent(params: {
    postId: string;
    actorUserId: string;
  }) {
    const ctx = await this.repo.loadContext(params);

    if (!ctx.post) {
      return {
        canShareInternal: false,
        canShareExternal: false,
        reason: 'NOT_FOUND',
      };
    }

    return ShareIntentPolicy.decide(ctx as any);
  }

  
}
