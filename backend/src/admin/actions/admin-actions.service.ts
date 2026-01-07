import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminActionsRepository } from './admin-actions.repository';
import { AdminActionsPolicy } from './policy/admin-actions.policy';
import { GetAdminActionsQueryDto } from './dto/get-admin-actions.query.dto';
import { AdminActionDto } from './dto/admin-action.dto';

@Injectable()
export class AdminActionsService {
  constructor(
    private readonly repo: AdminActionsRepository,
  ) {}

  /**
   * GET /admin/actions
   * - Read-only audit timeline
   * - Backend is authority
   * - canUnhide is computed here (policy decision)
   */
  async getActions(
    query: GetAdminActionsQueryDto,
  ): Promise<{
    items: AdminActionDto[];
    total: number;
  }> {
    AdminActionsPolicy.assertValidQuery(query);

    const { items, total } =
      await this.repo.findActions(query);

    const enriched = await Promise.all(
      items.map(async (action) => {
        /**
         * ==================================================
         * Authority decision: canUnhide
         * ==================================================
         *
         * - Computed by backend only
         * - Frontend MUST NOT derive this
         */
        let canUnhide = false;

        /**
         * Only reversible HIDE actions can be reverted (UNHIDE)
         * - Supports Prisma enum (HIDE)
         * - Supports legacy string-based actions (HIDE_*)
         * - Policy layer decides classification
         */
        if (
          AdminActionsPolicy.isReversibleHideAction(
            action,
          )
        ) {
          canUnhide =
            await this.repo.canUnhideAction(
              action,
            );
        }

        return AdminActionDto.from({
          ...action,
          canUnhide,
        });
      }),
    );

    return {
      items: enriched,
      total,
    };
  }

  /**
   * GET /admin/actions/:id
   * - Read-only
   * - canUnhide still applies for detail view
   */
  async getById(
    id: string,
  ): Promise<AdminActionDto> {
    const action = await this.repo.findById(
      id,
    );

    if (!action) {
      throw new NotFoundException(
        'Admin action not found',
      );
    }

    AdminActionsPolicy.assertReadable(
      action,
    );

    let canUnhide = false;

    if (
      AdminActionsPolicy.isReversibleHideAction(
        action,
      )
    ) {
      canUnhide =
        await this.repo.canUnhideAction(
          action,
        );
    }

    return AdminActionDto.from({
      ...action,
      canUnhide,
    });
  }
}
