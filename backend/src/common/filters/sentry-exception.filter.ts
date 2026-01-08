// backend/src/common/filters/sentry-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

const DROP_PATHS = [
  '/health',
  '/system-check',
  '/ready',
];

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const path = req?.originalUrl || req?.url || '';

    // =====================================================
    // Skip health / infra endpoints
    // =====================================================
    const shouldDrop =
      DROP_PATHS.some((p) => path.startsWith(p));

    if (!shouldDrop) {
      Sentry.withScope((scope) => {
        try {
          // ----------------------------
          // Tags (low-cardinality)
          // ----------------------------
          scope.setTag('http.method', req?.method || 'unknown');
          scope.setTag('http.route', path || 'unknown');
          scope.setTag(
            'service',
            process.env.SERVICE_NAME || 'backend-api',
          );
          scope.setTag(
            'env',
            process.env.NODE_ENV || 'production',
          );

          if (req?.ip) {
            scope.setTag('client.ip', req.ip);
          }

          // ----------------------------
          // User (if exists)
          // ----------------------------
          const user = (req as any)?.user;
          if (user) {
            scope.setUser({
              id: user.id || user.userId,
            });
          }

          // ----------------------------
          // Context (sanitized)
          // ----------------------------
          if (req?.headers) {
            scope.setContext(
              'headers',
              sanitizeHeaders(req.headers),
            );
          }

          if (req?.query) {
            scope.setContext(
              'query',
              sanitizeObject(req.query),
            );
          }

          if (req?.body) {
            scope.setContext(
              'body',
              sanitizeObject(req.body),
            );
          }

          // ----------------------------
          // Severity mapping
          // ----------------------------
          let level: Sentry.SeverityLevel = 'error';

          if (status >= 500) {
            level = 'error';
          } else if (status === 401 || status === 403) {
            // auth errors are security signals but not system failure
            level = 'warning';
          } else if (status >= 400) {
            // expected client errors
            level = 'info';
          }

          scope.setLevel(level);

          // ----------------------------
          // Capture
          // ----------------------------
          if (exception instanceof HttpException) {
            Sentry.captureException(exception);
          } else {
            Sentry.captureException(exception as any);
          }
        } catch (err) {
          // absolutely must not affect response path
          // eslint-disable-next-line no-console
          console.error(
            'SentryExceptionFilter internal error',
            err,
          );
        }
      });
    }

    // =====================================================
    // Preserve original HTTP response behavior
    // =====================================================
    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: 'Internal server error',
          };

    if (!res.headersSent) {
      res.status(status).json(payload);
    }
  }
}

// =====================================================
// Helpers
// =====================================================

function sanitizeHeaders(
  headers: Record<string, any>,
) {
  const copy = { ...headers };

  const SENSITIVE = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
  ];

  for (const k of Object.keys(copy)) {
    if (SENSITIVE.includes(k.toLowerCase())) {
      copy[k] = '**redacted**';
    }
  }

  return copy;
}

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const SENSITIVE_KEYS = [
    'password',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'otp',
    'pin',
  ];

  if (Array.isArray(obj)) {
    return obj.map((v) => sanitizeObject(v));
  }

  const out: any = {};

  for (const k of Object.keys(obj)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
      out[k] = '**redacted**';
    } else if (typeof obj[k] === 'object') {
      out[k] = sanitizeObject(obj[k]);
    } else {
      out[k] = obj[k];
    }
  }

  return out;
}
