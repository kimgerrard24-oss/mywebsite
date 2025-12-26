// backend/src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
   Put,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { GetNotificationsQueryDto } from './dto/get-notifications.query.dto';
import { MarkNotificationReadParams } from './dto/mark-notification-read.params';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly service: NotificationsService,
  ) {}

  /**
   * =========================
   * GET /notifications
   * =========================
   * - Auth: Cookie-based
   * - Authority: Redis session
   * - Pagination mandatory
   */
  @Get()
  @UseGuards(AccessTokenCookieAuthGuard)
  async getNotifications(
    @CurrentUser() user: { userId: string },
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.service.getNotifications({
      viewerUserId: user.userId,
      cursor: query.cursor ?? null,
      limit: query.limit,
    });
  }

 
  /**
   * =========================
   * PUT /notifications/:id/read
   * =========================
   * - Auth: Cookie-based
   * - Authority: Redis session
   * - Owner-only
   */
  @Put(':id/read')
  @UseGuards(AccessTokenCookieAuthGuard)
  async markRead(
    @Param() params: MarkNotificationReadParams,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.markNotificationRead({
      notificationId: params.id,
      viewerUserId: user.userId,
    });
  }
}
