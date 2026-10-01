import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl } = req;
    const requestId = (req as any)?.requestId || req.headers['x-request-id'] || '-';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(`[${requestId}] ${method} ${originalUrl} ${statusCode} +${duration}ms`);
        },
        error: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode || 500;
          this.logger.warn(`[${requestId}] ${method} ${originalUrl} ${statusCode} +${duration}ms (FAILED)`);
        },
      }),
    );
  }
}
