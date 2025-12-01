// File: backend/src/common/filters/sentry-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse();

      const status =
         exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

         // Add request context and tags
      Sentry.withScope((scope) => {
        try {
           // Request metadata
           scope.setTag('route', req && (req as any).url ? (req as any).url : 'unknown');
           scope.setTag('method', req && (req as any).method ? (req as any).method : 'unknown');
           scope.setTag('service', process.env.SERVICE_NAME || 'backend-api');
           scope.setTag('env', process.env.NODE_ENV || 'production');

           // IP and headers
          if (req && (req as any).ip) scope.setTag('ip', (req as any).ip);
          if (req && (req as any).headers) scope.setContext('headers', sanitizeHeaders((req as any).headers));


           // User context if available (do not include PII fields that are sensitive)
          const user = (req as any).user;
          if (user) {
            const safeUser: Record<string, any> = {
               id: user.id || user.userId || undefined,
               role: user.role || undefined,
             };
             scope.setUser(safeUser as any);
           }

           // Add body & query lightly (mask sensitive fields)
if (req && (req as any).body) scope.setContext('body', maskSensitiveData((req as any).body));
if (req && (req as any).query) scope.setContext('query', (req as any).query);


// Tag DB / Redis errors specially
if ((exception as any)?.code) scope.setTag('error_code', (exception as any).code);


// Capture exception with level based on status
const level = status >= 500 ? 'error' : status >= 400 ? 'warning' : 'info';
// capture
Sentry.captureException(exception as Error);
} catch (err) {
// ensure filter never throws
console.error('SentryExceptionFilter capture error', err);
}
});

     // respond same as default error handling; do not leak internal errors
if (!res.headersSent) {
res.status(status).json({
statusCode: status,
message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : (exception as any)?.message,
});
}
}
}

// Helpers
function sanitizeHeaders(headers: Record<string, any>) {
const copy = { ...headers };
// Remove or mask Authorization and cookie by default
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