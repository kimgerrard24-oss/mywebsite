// file: src/sentry.interceptor.ts

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as Sentry from '@sentry/node';
import { createHash } from 'crypto';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private isHealthRoute(url?: string): boolean {
    if (!url) return false;
    return (
      url.includes('/health') ||
      url.includes('/system-check') ||
      url.includes('/ready')
    );
  }

  private hashJti(jti: string): string {
    return createHash('sha256').update(jti).digest('hex').slice(0, 16);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: any = context.switchToHttp().getRequest();

    if (!req || this.isHealthRoute(req.url)) {
      return next.handle();
    }

    try {
      const scope = Sentry.getCurrentScope();

      if (scope) {
        // ===== Route =====
        scope.setTag('route', req.originalUrl || req.url);
        scope.setTag('method', req.method);

        // ===== User / Session (from backend authority) =====
        if (req.user?.userId) {
          scope.setUser({
            id: req.user.userId,
          });

          if (req.user.jti) {
            scope.setTag(
              'session',
              this.hashJti(String(req.user.jti)),
            );
          }
        } else {
          scope.setUser(null);
        }

        // ===== Network context =====
        scope.setContext('request_meta', {
          ip:
            (req.headers?.['x-forwarded-for'] as string)
              ?.split(',')[0]
              ?.trim() || req.ip || null,
          userAgent: req.headers?.['user-agent'] || null,
        });

        // ===== Params / Query (safe) =====
        if (req.params && Object.keys(req.params).length > 0) {
          scope.setExtra('params', req.params);
        }

        if (req.query && Object.keys(req.query).length > 0) {
          scope.setExtra('query', req.query);
        }

        // ===== Body (strictly sanitized & limited) =====
        if (req.body && typeof req.body === 'object') {
          const safeBody: Record<string, any> = {};

          for (const [k, v] of Object.entries(req.body)) {
            if (
              /password|token|secret|refresh|access/i.test(k)
            ) {
              safeBody[k] = '[MASKED]';
            } else if (
              typeof v === 'string' &&
              v.length > 200
            ) {
              safeBody[k] = '[TRUNCATED]';
            } else {
              safeBody[k] = v;
            }
          }

          if (Object.keys(safeBody).length > 0) {
            scope.setExtra('body', safeBody);
          }
        }
      }
    } catch {
      // must never break request flow
    }

    return next.handle();
  }
}
