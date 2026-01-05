// backend/src/admin/actions/admin-actions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminActionsRepository } from './admin-actions.repository';
import { AdminActionsPolicy } from './policy/admin-actions.policy';
import { GetAdminActionsQueryDto } from './dto/get-admin-actions.query.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Injectable()
export class AdminActionsService {
  constructor(
    private readonly repo: AdminActionsRepository,
  ) {}

  async getActions(
    query: GetAdminActionsQueryDto,
  ): Promise<{
    items: AdminActionDto[];
    total: number;
  }> {
    AdminActionsPolicy.assertValidQuery(query);

    const { items, total } =
      await this.repo.findActions(query);

    return {
      items: items.map(AdminActionDto.from),
      total,
    };
  }

  async getById(id: string) {
    const action = await this.repo.findById(id);

    if (!action) {
      throw new NotFoundException(
        'Admin action not found',
      );
    }

    AdminActionsPolicy.assertReadable(action);

    return action;
  }
}

