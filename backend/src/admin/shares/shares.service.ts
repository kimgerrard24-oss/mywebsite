// backend/src/admin/shares/shares.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { SharesRepository } from './shares.repository';
import { SharePolicy } from './policy/share.policy';
import { ShareAuditService } from './audit/share-audit.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class SharesService {
  constructor(
    private readonly repo: SharesRepository,
    private readonly audit: ShareAuditService,
    private readonly notify: NotificationsService,
  ) {}

  /**
   * FINAL AUTHORITY
   * Service → Repo(load) → Policy → DB → Audit → Notify
   */
  async disableShare(params: {
    shareId: string;
    adminUserId: string;
    reason: string;
  }) {
    const ctx = await this.repo.loadContext({
      shareId: params.shareId,
    });

    const decision = SharePolicy.decide(ctx);

    if (decision === 'NOT_FOUND') {
      throw new NotFoundException('Share not found');
    }

    if (decision === 'ALREADY_DISABLED') {
      throw new ConflictException('Share already disabled');
    }

    const row = await this.repo.disableShare({
      shareId: params.shareId,
      adminUserId: params.adminUserId,
      reason: params.reason,
    });
    
   if (!row.disabledAt) {
  // defensive — should never happen
  throw new Error(
    'Invariant violation: disabledAt is null after disableShare()',
  );
}
    
    // audit (must succeed)
    await this.audit.log({
      adminUserId: params.adminUserId,
      shareId: params.shareId,
      reason: params.reason,
    });

   
if (ctx.share?.senderId) {
  this.notify
    .createNotification({
      userId: ctx.share.senderId,       
      actorUserId: params.adminUserId,  
      type: 'moderation_action',
      entityId: params.shareId,
      payload: {
        actionType: 'HIDE',              
        targetType: 'FOLLOW',            
        targetId: params.shareId,
        reason: params.reason,
      },
    })
    .catch(() => {});
}


    return {
      id: row.id,
      disabledAt: row.disabledAt.toISOString(),
      disabledByAdminId: row.disabledByAdminId!,
    };
  }
}
