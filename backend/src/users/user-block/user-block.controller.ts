// backend/src/users/user-block/user-block.controller.ts

import {
  Controller,
  Post,
  Param,
  Delete,
  Get,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { BlockUserParamsDto } from './dto/block-user.params.dto';
import { UserBlockService } from './user-block.service';
import { UnblockUserParamsDto } from './dto/unblock-user.params.dto';
import { GetMyBlocksQueryDto } from './dto/get-my-blocks.query.dto';

@Controller('users')
export class UserBlockController {
  constructor(
    private readonly userBlockService: UserBlockService,
  ) {}

  @Post(':id/block')
  @UseGuards(AccessTokenCookieAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async blockUser(
    @Param() params: BlockUserParamsDto,
    @Req() req: Request,
  ) {
    const sessionUser = req.user as {
      userId: string;
      jti: string;
      role: 'USER' | 'ADMIN';
    };

    await this.userBlockService.blockUser({
      blockerId: sessionUser.userId,
      targetUserId: params.id,
    });
  }

    // ===== DELETE /users/:id/block =====
  @Delete(':id/block')
  @UseGuards(AccessTokenCookieAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblockUser(
    @Param() params: UnblockUserParamsDto,
    @Req() req: Request,
  ) {
    const sessionUser = req.user as {
      userId: string;
      jti: string;
      role: 'USER' | 'ADMIN';
    };

    await this.userBlockService.unblockUser({
      blockerId: sessionUser.userId,
      targetUserId: params.id,
    });
  }

   /**
   * GET /users/me/blocks
   */
  @Get('me/blocks')
  @UseGuards(AccessTokenCookieAuthGuard)
  async getMyBlocks(
    @Query() query: GetMyBlocksQueryDto,
    @Req() req: Request,
  ) {
    const sessionUser = req.user as {
      userId: string;
      jti: string;
      role: 'USER' | 'ADMIN';
    };

    return this.userBlockService.getMyBlockedUsers({
      requesterId: sessionUser.userId,
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}
