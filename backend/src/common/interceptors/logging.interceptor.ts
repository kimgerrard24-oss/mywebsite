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
    // Cloudflare
    if (req.headers['cf-connecting-ip']) {
      const cf = String(req.headers['cf-connecting-ip']).split(',')[0].trim();
      return cf.replace(/^::ffff:/, '').replace(/:\d+$/, '');
    }

    // Proxy chain
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      const first = xff.split(',')[0].trim();
      return first.replace(/^::ffff:/, '').replace(/:\d+$/, '');
    }

    // nginx / traefik
    if (req.headers['x-real-ip']) {
      const xr = String(req.headers['x-real-ip']).trim();
      return xr.replace(/^::ffff:/, '').replace(/:\d+$/, '');
    }

    // fallback
    const ip =
      (req.socket && req.socket.remoteAddress) ||
      req.ip ||
      '';

    return String(ip)
      .replace(/^::ffff:/, '')
      .replace(/:\d+$/, '')
      .trim();
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

          span?.setStatus({ code: 1 });
          span?.end();
        },
        (err) => {
          Sentry.captureException(err);

          span?.setStatus({ code: 2 });
          span?.end();
        },
      ),
    );
  }
}
