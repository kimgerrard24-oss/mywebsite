// src/common/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';
import type { Span } from '@sentry/core';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private getRealIp(req: any): string {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string') {
      return fwd.split(',')[0].trim();
    }
    return (req.ip || '').replace('::ffff:', '');
  }

  private sanitizeRoute(route: string): string {
    if (!route) return '';
    return route.replace(/token=[^&]+/gi, 'token=[redacted]');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: any = context.switchToHttp().getRequest();
    const start = Date.now();

    const rawRoute = req?.url || 'unknown';
    const route = this.sanitizeRoute(rawRoute);
    const method = req?.method || 'GET';
    const realIp = this.getRealIp(req);

    const span: Span | undefined = Sentry.startInactiveSpan({
      op: 'http.server',
      name: `${method} ${route}`,
      attributes: {
        ip: realIp,
        method,
        route,
      },
    });

    Sentry.addBreadcrumb({
      category: 'request',
      message: `${method} ${route}`,
      level: 'info',
      data: { ip: realIp },
    });

    return next.handle().pipe(
      tap(
        () => {
          const duration = Date.now() - start;

          if (duration > Number(process.env.SLOW_REQUEST_THRESHOLD_MS || 1500)) {
            Sentry.addBreadcrumb({
              category: 'performance',
              message: `Slow request ${duration}ms`,
              level: 'warning',
              data: { duration, route },
            });

            span?.setAttribute('slow_request', true);
          }

          // OK = 1
          span?.setStatus({ code: 1 });
          span?.end();
        },
        (err) => {
          Sentry.captureException(err);

          // ERROR = 2
          span?.setStatus({ code: 2 });
          span?.end();
        },
      ),
    );
  }
}
