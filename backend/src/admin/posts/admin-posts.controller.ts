// backend/src/admin/posts/admin-posts.controller.ts

import {
  Controller,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminPostsService } from './admin-posts.service';
import { DeleteAdminPostDto } from './dto/delete-admin-post.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('admin/posts')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminPostsController {
  constructor(
    private readonly service: AdminPostsService,
  ) {}

  /**
   * DELETE /admin/posts/:id
   * Admin-only (soft delete)
   */
  @Delete(':id')
  @RateLimit('adminPostDelete')
  async deletePost(
    @Param('id') postId: string,
    @Body() dto: DeleteAdminPostDto,
  ) {
    await this.service.deletePost({
      postId,
      reason: dto.reason,
    });

    return { success: true };
  }
}
