// backend/src/profile/profile-media.controller.ts

import {
  Controller,
  Patch,
  Body,
  Post,
  UseGuards,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { ProfileMediaService } from './profile-media.service';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { SetCoverDto } from './dto/set-cover.dto';
import { GetProfileMediaQueryDto } from './dto/get-profile-media.query.dto';
import { SetCurrentProfileMediaDto } from './dto/set-current-profile-media.dto';
import { GetCurrentProfileMediaParamsDto } from './dto/get-current-profile-media.params.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { DeleteProfileMediaParamsDto } from './dto/delete-profile-media.params.dto';

@Controller('users')
export class ProfileMediaController {
  constructor(private readonly service: ProfileMediaService) {}

  // ==========================
  // PATCH /users/me/avatar
  // ==========================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('updateAvatar')
  @Patch('me/avatar')
  async setAvatar(
    @CurrentUser() user: SessionUser,
    @Body() dto: SetAvatarDto,
  ) {
    return this.service.setAvatar(user.userId, dto.mediaId);
  }

  // ==========================
  // PATCH /users/me/cover
  // ==========================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('updateCover')
  @Patch('me/cover')
  async setCover(
    @CurrentUser() user: SessionUser,
    @Body() dto: SetCoverDto,
  ) {
    return this.service.setCover({
      actorUserId: user.userId,
      mediaId: dto.mediaId,
    });
  }

  // ==========================
  // GET /users/:userId/profile-media
  // ==========================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('mediaGallery')
  @Get(':userId/profile-media')
  async getProfileMedia(
    @Param('userId') userId: string,
    @Query() query: GetProfileMediaQueryDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.getProfileMedia(
      user?.userId ?? null,
      userId,
      query,
    );
  }

  // ==========================
  // POST /users/me/profile-media/:mediaId/set-current
  // ==========================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('updateProfile')
  @Post('me/profile-media/:mediaId/set-current')
  async setCurrent(
    @Param('mediaId') mediaId: string,
    @Body() dto: SetCurrentProfileMediaDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.setCurrentProfileMedia({
      actorUserId: user.userId,
      mediaId,
      type: dto.type,
    });
  }

  // ==========================
  // GET /users/:userId/profile-media/current
  // ==========================
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('mediaGallery')
  @Get(':userId/profile-media/current')
  async getCurrentProfileMedia(
    @Param() params: GetCurrentProfileMediaParamsDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.getCurrentProfileMedia(
      user?.userId ?? null,
      params.userId,
    );
  }

   @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('deleteProfileMedia')
  @Delete('me/profile-media/:mediaId')
  async deleteProfileMedia(
    @Param() params: DeleteProfileMediaParamsDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.deleteProfileMedia({
      actorUserId: user.userId,
      mediaId: params.mediaId,
    });
  }
}

