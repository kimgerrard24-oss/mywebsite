// backend/src/users/mention/mention.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MentionService } from './mention.service';
import { MentionSearchQueryDto } from './dto/mention-search.query.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { SessionUser } from '../../auth/services/validate-session.service';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

/**
 * MentionController
 *
 * Domain: mention / autocomplete
 *
 * ✅ แยก namespace ออกจาก /users
 * เพื่อหลีกเลี่ยง route collision กับ:
 *   GET /users/:id
 *
 * Endpoint:
 *   GET /mentions/search
 */
@Controller('mentions')
export class MentionController {
  constructor(
    private readonly mentionService: MentionService,
  ) {}

  /**
   * GET /mentions/search
   *
   * ใช้สำหรับ @mention autocomplete
   *
   * Guards:
   * - ต้อง login
   * - session จาก Redis เป็น authority
   *
   * Behavior:
   * - fail-soft
   * - ไม่คืน user ตัวเอง
   * - filter inactive / disabled users (service layer)
   */
  @Get('search')
  @RateLimit('mentionSearch') // ✅ add rate-limit for mention autocomplete
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
