// backend/src/users/export/profile-export.controller.ts

import {
  Controller,
  Get,
  UseGuards,
  Header,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { ProfileExportService } from './profile-export.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('/users/me/profile')
export class ProfileExportController {
  constructor(
    private readonly service: ProfileExportService,
  ) {}

  /**
   * GET /users/me/profile/export
   *
   * - Auth: cookie session (backend authority)
   * - Policy: handled in service (DB authority)
   * - Response: attachment JSON (GDPR-style export)
   */
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('profileExport')
  @Get('/export')
  @Header(
    'Content-Type',
    'application/json; charset=utf-8',
  )
  async exportMyProfile(
    @CurrentUser() user: SessionUser,
  ) {
    const userId = user?.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    const result =
      await this.service.exportProfile(userId);

    const filename =
      `phlyphant-profile-${new Date()
        .toISOString()
        .slice(0, 19)}.json`;

    // NestJS จะ set header และ serialize ให้เอง
    return {
      __meta: {
        filename,
        disposition: 'attachment',
      },
      ...result,
    };
  }
}


