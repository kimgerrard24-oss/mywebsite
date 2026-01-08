// backend/src/admin/guards/admin-role.guard.ts

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  private readonly logger = new Logger(AdminRoleGuard.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req =
      context.switchToHttp().getRequest();

    const user = req.user as
      | { userId: string; jti: string }
      | undefined;

    if (!user?.userId) {
      // auth guard should already block this,
      // but keep defensive check
      throw new ForbiddenException();
    }

    try {
      const result =
        await this.prisma.user.findUnique({
          where: { id: user.userId },
          select: {
            role: true,
            isDisabled: true,
            active: true,
          },
        });

      if (!result) {
        // user disappeared → treat as forbidden
        this.logger.warn(
          `Admin access denied: user not found userId=${user.userId}`,
        );
        throw new ForbiddenException(
          'Admin only',
        );
      }

      // optional but production-safe:
      if (
        result.isDisabled === true ||
        result.active === false
      ) {
        this.logger.warn(
          `Admin access denied: inactive user userId=${user.userId}`,
        );
        throw new ForbiddenException(
          'Admin only',
        );
      }

      if (result.role !== 'ADMIN') {
        this.logger.warn(
          `Admin access denied: non-admin role=${result.role} userId=${user.userId}`,
        );
        throw new ForbiddenException(
          'Admin only',
        );
      }

      return true;
    } catch (err) {
      // if it's already Forbidden → rethrow
      if (err instanceof ForbiddenException) {
        throw err;
      }

      // DB / infra error → log & fail closed
      this.logger.error(
        `AdminRoleGuard DB error for userId=${user.userId}`,
        err as any,
      );

      // fail closed: never allow admin access on error
      throw new ForbiddenException(
        'Admin only',
      );
    }
  }
}
