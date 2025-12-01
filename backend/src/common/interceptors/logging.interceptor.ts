// files /src/common/interceptors/logging.interceptor.ts

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
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & any>();
    const res = context.switchToHttp().getResponse();

    const start = Date.now();
    const route = req?.url || 'unknown';

    // Start a Sentry span using getCurrentScope
    const span = Sentry.startSpan(
      {
        op: 'http.server',
        name: `${req?.method || 'GET'} ${route}`,
      },
      () => {
        // Add basic breadcrumbs
        Sentry.addBreadcrumb({
          category: 'request',
          message: `${req?.method} ${route}`,
          level: 'info',
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
                });
                
                const currentSpan = Sentry.getActiveSpan();
                if (currentSpan) {
                  currentSpan.setAttribute('slow_request', 'true');
                }
              }

              const currentSpan = Sentry.getActiveSpan();
              if (currentSpan) {
                currentSpan.setStatus({ code: 1, message: 'ok' });
              }
            },
            (err) => {
              // on error - capture exception
              Sentry.captureException(err);
              
              const currentSpan = Sentry.getActiveSpan();
              if (currentSpan) {
                currentSpan.setStatus({ code: 2, message: 'error' });
              }
            },
          ),
        );
      },
    );

    return span as any;
  }
}