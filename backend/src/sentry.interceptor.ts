// file: src/sentry.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const scope = Sentry.getCurrentScope();

    if (scope && req) {
      scope.setTag('path', req.url);
      scope.setUser({
        id: req.user?.id || 'guest',
      });

      const safeBody = { ...req.body };
      if (safeBody.password) safeBody.password = '[MASKED]';
      if (safeBody.newPassword) safeBody.newPassword = '[MASKED]';
      if (safeBody.token) safeBody.token = '[MASKED]';

      scope.setExtra('body', safeBody);
      scope.setExtra('query', req.query);
      scope.setExtra('params', req.params);
    }

    return next.handle();
  }
}
