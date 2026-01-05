// backend/src/admin/users/admin-users.controller.ts
import {
  Controller,
  Body,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { GetAdminUsersQueryDto } from './dto/get-admin-users.query.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { BanUserDto } from './dto/ban-user.dto';
import { GetAdminUserParamDto } from './dto/get-admin-user.param.dto';

@Controller('admin/users')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminUsersController {
  constructor(
    private readonly service: AdminUsersService,
  ) {}

  /**
   * GET /admin/users
   * Admin-only
   */
  @Get()
  @RateLimit('adminUsersList')
  async getUsers(
    @Query() query: GetAdminUsersQueryDto,
  ) {
    return this.service.getUsers(query);
  }

  /**
   * PUT /admin/users/:id/ban
   * Admin-only
   */
  @Put(':id/ban')
  @RateLimit('adminUserBan')
  async banUser(
    @Param('id') userId: string,
    @Body() dto: BanUserDto,
  ) {
    await this.service.banUser({
      targetUserId: userId,
      banned: dto.banned,
      reason: dto.reason,
    });

    return { success: true };
  }

   /**
   * GET /admin/users/:id
   * - Admin user evidence view (read-only)
   */
  @Get(':id')
  async getUserById(
    @Param() param: GetAdminUserParamDto,
  ) {
    return this.service.getUserById(param.id);
  }
}
