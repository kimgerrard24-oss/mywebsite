// backend/src/media/media.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  Post,
  NotFoundException,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MediaService } from './media.service';
import { PresignValidateDto } from './dto/presign-validate.dto';
import { MediaCompleteDto } from './dto/media-complete.dto';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { OptionalAuthGuard } from '../posts/guards/optional-auth.guard';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /media/presign/validate
   * - Authenticated only
   * - Returns presigned upload URL
   */
  @Post('presign/validate')
  @RateLimit('mediaPresign')
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
  @RateLimit('mediaComplete')
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

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async getMediaById(
    @Param('id') mediaId: string,
    @Req() req: Request,
  ) {
    const viewerUserId =
      req.user && typeof req.user === 'object'
        ? (req.user as any).userId
        : null;

    const media = await this.mediaService.getMediaMetadata({
      mediaId,
      viewerUserId,
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

}
