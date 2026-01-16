// backend/src/users/export/profile-export.controller.ts

import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { ProfileExportService } from './profile-export.service';

@Controller('/users/me/profile')
export class ProfileExportController {
  constructor(
    private readonly service: ProfileExportService,
  ) {}

  @UseGuards(AccessTokenCookieAuthGuard)
  @Get('/export')
  async exportMyProfile(
    @Req() req: Request & { user?: { userId?: string } },
    @Res() res: Response,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).end();
    }

    const result =
      await this.service.exportProfile(userId);

    const filename =
      `phlyphant-profile-${new Date()
        .toISOString()
        .slice(0, 19)}.json`;

    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    res.status(200).send(
      JSON.stringify(result, null, 2),
    );
  }
}