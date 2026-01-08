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
    const res: any = context.switchToHttp().getResponse();
    const start = Date.now();

    const rawRoute = req?.originalUrl || req?.url || 'unknown';
    const route = this.sanitizeRoute(rawRoute);
    const method = req?.method || 'GET';
    const realIp = this.getRealIp(req);

    // ===== Breadcrumb: request start =====
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${route}`,
      level: 'info',
      data: {
        method,
        route,
      },
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const statusCode = res?.statusCode;

          // ===== Breadcrumb: request finished =====
          Sentry.addBreadcrumb({
            category: 'http',
            message: `Response ${statusCode}`,
            level: statusCode >= 500 ? 'error' : 'info',
            data: {
              method,
              route,
              statusCode,
              durationMs: duration,
            },
          });

          // ===== Performance signal =====
          const slowThreshold =
            Number(process.env.SLOW_REQUEST_THRESHOLD_MS) || 1500;

          if (duration > slowThreshold) {
            Sentry.addBreadcrumb({
              category: 'performance',
              message: 'Slow request detected',
              level: 'warning',
              data: {
                durationMs: duration,
                thresholdMs: slowThreshold,
                route,
              },
            });
          }
        },

        error: () => {
          // ❗ DO NOT capture exception here
          // Global SentryExceptionFilter will handle error reporting

          const duration = Date.now() - start;

          Sentry.addBreadcrumb({
            category: 'http',
            message: 'Request failed',
            level: 'error',
            data: {
              method,
              route,
              durationMs: duration,
            },
          });
        },
      }),
    );
  }
}
