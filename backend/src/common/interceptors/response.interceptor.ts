import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const httpCtx = context.switchToHttp();
    const res = httpCtx.getResponse<Response>();

    return next.handle().pipe(
      map((body) => {
        const status = res.statusCode;

        // Preserve error responses
        if (status >= 400) {
          return body;
        }

        // Handle pagination structure
        if (body && typeof body === 'object') {
          const hasPagination =
            'items' in body &&
            'page' in body &&
            'total' in body;

          if (hasPagination) {
            return {
              success: true,
              statusCode: status,
              data: body.items,
              pagination: {
                page: body.page,
                pageSize: body.pageSize,
                total: body.total,
                totalPages: body.totalPages,
              },
            };
          }

          // Support meta envelope
          if ('data' in body && 'meta' in body) {
            return {
              success: true,
              statusCode: status,
              data: body.data,
              meta: body.meta,
            };
          }
        }

        // Default transform for standard responses
        return {
          success: true,
          statusCode: status,
          data: body,
        };
      }),
    );
  }
}
