// backend/src/media/media.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MediaService } from './media.service';
import { PresignValidateDto } from './dto/presign-validate.dto';
import { MediaCompleteDto } from './dto/media-complete.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /media/presign/validate
   * - Authenticated only
   * - Returns presigned upload URL
   */
  @Post('presign/validate')
  @HttpCode(200)
  @UseGuards(AccessTokenCookieAuthGuard)
  async validatePresign(
    @Body() dto: PresignValidateDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string; jti: string };

    return this.mediaService.validateAndPresign({
      actorUserId: actor.userId,
      dto,
    });
  }

  @Post('complete')
  @HttpCode(201)
  @UseGuards(AccessTokenCookieAuthGuard)
  async completeUpload(
    @Body() dto: MediaCompleteDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { userId: string; jti: string };

    return this.mediaService.completeUpload({
      actorUserId: actor.userId,
      objectKey: dto.objectKey,
      mediaType: dto.mediaType,
      mimeType: dto.mimeType,
    });
  }

}
