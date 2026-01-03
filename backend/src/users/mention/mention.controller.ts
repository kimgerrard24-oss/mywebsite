// backend/src/users/mention/mention.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MentionService } from './mention.service';
import { MentionSearchQueryDto } from './dto/mention-search.query.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';

@Controller('users')
export class MentionController {
  constructor(private readonly mentionService: MentionService) {}

  /**
   * GET /users/mention-search
   *
   * ใช้สำหรับ @mention autocomplete
   * - ต้อง login
   * - ใช้ session จาก Redis เป็น authority
   */
  @Get('mention-search')
  @UseGuards(AccessTokenCookieAuthGuard)
  async search(
    @Query() query: MentionSearchQueryDto,
    @CurrentUser() user: SessionUser,
  ) {
    const { q, limit } = query;

    return this.mentionService.searchUsersForMention({
      query: q.trim(),
      limit: limit ?? 10,
      requesterId: user.userId,
    });
  }
}
