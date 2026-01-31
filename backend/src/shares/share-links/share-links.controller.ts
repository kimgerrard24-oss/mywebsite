// backend/src/shares/share-links/share-links.controller.ts

import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { ShareLinksService } from './share-links.service';

@Controller('s')
export class ShareLinksController {
  constructor(
    private readonly service: ShareLinksService,
  ) {}

  @UseGuards(OptionalAuthGuard)
  @Get(':code')
  async resolve(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const viewerUserId =
      (req.user as any)?.userId ?? null;

    const result =
      await this.service.resolveShareLink({
        code,
        viewerUserId,
        ip: req.ip,
        userAgent: req.get('user-agent') ?? null,
      });

    // 🔥 redirect จริง (HTTP 302)
    return res.redirect(result.redirectUrl);
  }
}



