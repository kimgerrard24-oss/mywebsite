// backend/src/users/export/profile-export.controller.ts

import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { ProfileExportService } from './profile-export.service';

@Controller('/users/me/profile')
export class ProfileExportController {
  constructor(
    private readonly service: ProfileExportService,
  ) {}

  @UseGuards(AccessTokenCookieAuthGuard)
  @Get('/export')
  async exportMyProfile(@Req() req: Request) {
    const user = req.user as { userId: string };

    return this.service.exportProfile(user.userId);
  }
}
