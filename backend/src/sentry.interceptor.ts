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

    // ใช้ scope ปัจจุบัน (รองรับ Sentry v8+)
    const scope = Sentry.getCurrentScope();
    if (scope) {
      scope.setTag('path', req.url);
      scope.setUser({
        id: req.user?.id || 'guest',
      });
      scope.setExtra('body', req.body);
      scope.setExtra('query', req.query);
      scope.setExtra('params', req.params);
    }

    return next.handle();
  }
}
