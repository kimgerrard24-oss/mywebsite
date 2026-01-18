// backend/src/users/export/profile-export.controller.ts

import {
  Controller,
  Get,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { ProfileExportService } from './profile-export.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import archiver from 'archiver';

@Controller('/users/me/profile')
export class ProfileExportController {
  constructor(
    private readonly service: ProfileExportService,
  ) {}

  /**
   * GET /users/me/profile/export
   *
   * - Auth: cookie session
   * - Policy: in service
   * - Response: ZIP attachment (multiple JSON files)
   */
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('profileExport')
  @Get('/export')
  async exportMyProfile(
    @CurrentUser() user: SessionUser,
    @Res() res: Response,
  ) {
    const userId = user?.userId;
    const jti = user?.jti;

    if (!userId || !jti) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    const result =
      await this.service.exportProfile({
        userId,
        jti,
      });

    const filename =
      `phlyphant-export-${new Date()
        .toISOString()
        .slice(0, 19)}.zip`;

    // ===============================
    // Response headers
    // ===============================
    res.setHeader(
      'Content-Type',
      'application/zip',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    // ===============================
    // ZIP streaming
    // ===============================
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (err: Error) => {
  console.error('[ProfileExport ZIP Error]', err);
  if (!res.headersSent) {
    res.status(500).end();
  }
});

    archive.pipe(res);

    for (const [name, content] of Object.entries(
      result.files,
    )) {
      archive.append(
        JSON.stringify(
          {
            exportedAt: result.exportedAt,
            data: content,
          },
          null,
          2,
        ),
        { name },
      );
    }

    await archive.finalize();
  }
}



