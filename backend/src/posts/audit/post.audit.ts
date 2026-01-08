// backend/src/posts/audit/post.audit.ts

import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../auth/audit.service';

@Injectable()
export class PostAudit {
  private readonly logger = new Logger(PostAudit.name);

  constructor(
    private readonly audit: AuditService,
  ) {}

  async logPostCreated(params: {
    postId: string;
    authorId: string;
  }) {
    try {
      await this.audit.createLog({
        userId: params.authorId,
        action: 'post.create',
        success: true,
        targetId: params.postId,
        metadata: null,
      });
    } catch (err) {
      // must never break main flow
      this.logger.warn(
        `Failed to audit post.create postId=${params.postId}`,
      );
    }
  }

  async logDeleted(params: {
    postId: string;
    actorUserId: string;
  }) {
    try {
      await this.audit.createLog({
        userId: params.actorUserId,
        action: 'post.delete',
        success: true,
        targetId: params.postId,
        metadata: null,
      });
    } catch {
      this.logger.warn(
        `Failed to audit post.delete postId=${params.postId}`,
      );
    }
  }

  async logUpdated(params: {
    postId: string;
    actorUserId: string;
  }) {
    try {
      await this.audit.createLog({
        userId: params.actorUserId,
        action: 'post.update',
        success: true,
        targetId: params.postId,
        metadata: null,
      });
    } catch {
      this.logger.warn(
        `Failed to audit post.update postId=${params.postId}`,
      );
    }
  }

  async logGeneric(params: {
    userId: string;
    action: string;
    targetId: string;
  }) {
    try {
      await this.audit.createLog({
        userId: params.userId,
        action: params.action,
        success: true,
        targetId: params.targetId,
        metadata: null,
      });
    } catch {
      this.logger.warn(
        `Failed to audit ${params.action} target=${params.targetId}`,
      );
    }
  }
}
