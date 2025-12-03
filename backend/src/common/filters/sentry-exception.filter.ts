// File: backend/src/common/filters/sentry-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

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

    Sentry.withScope((scope) => {
      try {
        scope.setTag('route', req?.url || 'unknown');
        scope.setTag('method', req?.method || 'unknown');
        scope.setTag('service', process.env.SERVICE_NAME || 'backend-api');
        scope.setTag('env', process.env.NODE_ENV || 'production');

        if (req?.ip) scope.setTag('ip', req.ip);
        if (req?.headers) scope.setContext('headers', sanitizeHeaders(req.headers));

        const user = (req as any)?.user;
        if (user) {
          const safeUser: Record<string, any> = {
            id: user.id || user.userId,
            role: user.role || undefined,
          };
          scope.setUser(safeUser as any);
        }

        if (req?.body) scope.setContext('body', maskSensitiveData(req.body));
        if (req?.query) scope.setContext('query', req.query);

        if ((exception as any)?.code) {
          scope.setTag('error_code', (exception as any).code);
        }

        const sentryLevel =
          status >= 500 ? 'error' : status >= 400 ? 'warning' : 'info';

        scope.setLevel(sentryLevel as any);

        Sentry.captureException(exception as any);
      } catch (err) {
        console.error('SentryExceptionFilter capture error', err);
      }
    });

    if (!res.headersSent) {
      res.status(status).json({
        statusCode: status,
        message:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Internal server error'
            : (exception instanceof HttpException
                ? exception.message
                : 'Request error'),
      });
    }
  }
}

function sanitizeHeaders(headers: Record<string, any>) {
  const copy = { ...headers };
  if (copy.authorization) copy.authorization = '**redacted**';
  if (copy.cookie) copy.cookie = '**redacted**';
  return copy;
}

function maskSensitiveData(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;

  const masked: any = Array.isArray(obj) ? [] : {};
  const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'ssn', 'creditCard'];

  for (const k of Object.keys(obj)) {
    if (sensitiveKeys.includes(k)) masked[k] = '**redacted**';
    else if (typeof obj[k] === 'object') masked[k] = maskSensitiveData(obj[k]);
    else masked[k] = obj[k];
  }

  return masked;
}
