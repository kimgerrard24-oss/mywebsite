// backend/src/posts/guards/optional-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // req.user จะถูก attach ถ้ามี session (โดย middleware หลักของคุณ)
    return true;
  }
}
