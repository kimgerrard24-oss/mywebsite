// backend/src/admin/comments/admin-comments.controller.ts

import {
  Controller,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminCommentsService } from './admin-comments.service';
import { AdminDeleteCommentDto } from './dto/admin-delete-comment.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('admin/comments')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminCommentsController {
  constructor(
    private readonly service: AdminCommentsService,
  ) {}

  /**
   * DELETE /admin/comments/:id
   * Admin-only soft delete
   */
  @Delete(':id')
  @RateLimit('adminDeleteComment')
  async deleteComment(
    @Param('id') id: string,
    @Body() body: AdminDeleteCommentDto,
  ) {
    return this.service.deleteComment({
      commentId: id,
      reason: body.reason,
    });
  }
}
