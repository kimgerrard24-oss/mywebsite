// backend/src/admin/actions/admin-actions.controller.ts

import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AdminActionsService } from './admin-actions.service';
import { GetAdminActionsQueryDto } from './dto/get-admin-actions.query.dto';
import { AdminActionDto } from './dto/admin-action.dto';
import { GetAdminActionParamsDto } from './dto/get-admin-action.params.dto'

@Controller('admin/actions')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminActionsController {
  constructor(
    private readonly service: AdminActionsService,
  ) {}

  /**
   * GET /admin/actions
   * Admin moderation audit timeline
   */
  @Get()
  async getActions(
    @Query() query: GetAdminActionsQueryDto,
  ): Promise<{
    items: AdminActionDto[];
    total: number;
  }> {
    return this.service.getActions(query);
  }

    /**
   * GET /admin/actions/:id
   * - Read-only admin audit action
   */
  @Get(':id')
  async getActionById(
    @Param() params: GetAdminActionParamsDto,
  ) {
    return this.service.getById(params.id);
  }
}
