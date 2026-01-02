// backend/src/admin/guards/admin-role.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req =
      context.switchToHttp().getRequest();

    const user = req.user as {
      userId: string;
      jti: string;
    };

    if (!user?.userId) {
      throw new ForbiddenException();
    }

    const role =
      await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { role: true },
      });

    if (role?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Admin only',
      );
    }

    return true;
  }
}
