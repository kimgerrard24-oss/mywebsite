// backend/src/shares/share-links/share-links.controller.ts

import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { ShareLinksService } from './share-links.service';

@Controller('s')
export class ShareLinksController {
  constructor(
    private readonly service: ShareLinksService,
  ) {}

  /**
   * GET /s/:code
   * Public entry for external share link
   */
  @UseGuards(OptionalAuthGuard)
  @Get(':code')
  async resolve(
    @Param('code') code: string,
    @Req() req: Request,
  ) {
    const viewerUserId =
      (req.user as any)?.userId ?? null;

    return this.service.resolveShareLink({
      code, 
      viewerUserId,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? null,
    });
  }
}


