// backend/src/shares/share-links/share-links.service.ts

// backend/src/shares/share-links/share-links.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  GoneException,
} from '@nestjs/common';

import { ShareLinksRepository } from './share-links.repository';
import { ShareLinkVisibilityPolicy } from './policy/share-link-visibility.policy';

@Injectable()
export class ShareLinksService {
  constructor(
    private readonly repo: ShareLinksRepository,
  ) {}

  /**
   * FINAL AUTHORITY
   * Service → Repo(load) → Policy → Stat update → return
   */
  async resolveShareLink(params: {
    code: string;
    viewerUserId: string | null;
    ip: string | undefined;
    userAgent: string | null;
  }) {
    const ctx = await this.repo.loadContext({
      code: params.code,
      viewerUserId: params.viewerUserId ?? null,
    });

    // =========================
    // HARD AUTHORITY CHECK
    // =========================
    if (!ctx.link || !ctx.post) {
      throw new NotFoundException(
        'Share link not found',
      );
    }

    const decision =
      ShareLinkVisibilityPolicy.decide({
        link: {
          isDisabled: ctx.link.isDisabled,
          expiresAt: ctx.link.expiresAt,
        },

        post: {
          isDeleted: ctx.post.isDeleted,
          isHidden: ctx.post.isHidden,
          visibility: ctx.post.visibility,
        },

        // normalize
        isBlockedEitherWay: !!ctx.isBlockedEitherWay,
        isFollower: !!ctx.isFollower,
        visibilityRule: ctx.visibilityRule ?? null,
        isAuthorPrivate: ctx.post.author.isPrivate,
      });

    if (decision === 'NOT_FOUND') {
      throw new NotFoundException();
    }

    if (
      decision === 'LINK_DISABLED' ||
      decision === 'LINK_EXPIRED'
    ) {
      throw new GoneException(
        'Share link expired or disabled',
      );
    }

    if (decision !== 'OK') {
      throw new ForbiddenException(
        'Not allowed to view this post',
      );
    }

    // =========================
    // FAIL-SOFT STATS UPDATE
    // =========================
    this.repo
      .updateStats({
        linkId: ctx.link.id,
        postId: ctx.post.id,
      })
      .catch(() => {});

    return {
  postId: ctx.post.id,
  redirectUrl: `/share/${ctx.post.id}`,
};

  }
}


