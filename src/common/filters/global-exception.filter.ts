import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api-response.type';
import { handleDatabaseError } from '../../database/database-error.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any)?.requestId || (request.headers['x-request-id'] as string) || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal server error occurred.';
    let details: any[] | undefined = undefined;

    // 1. Handle NestJS HttpException (including validation errors)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, any>;
        message = (Array.isArray(resObj.message) ? 'Request validation failed.' : resObj.message) || exception.message;

        if (resObj.code) {
          code = resObj.code;
        } else if (Array.isArray(resObj.message)) {
          code = 'VALIDATION_ERROR';
          details = resObj.message.map((msg: string) => ({ message: msg }));
        } else {
          code = this.getErrorCodeFromStatus(status);
        }

        if (resObj.details) {
          details = resObj.details;
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCodeFromStatus(status);
      }
    }
    // 2. Handle Prisma Database Errors
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    ) {
      const dbError = handleDatabaseError(exception);
      status = dbError.statusCode;
      code = dbError.code;
      message = dbError.message;
      if (dbError.target) {
        details = dbError.target.map((t) => ({ field: t, message: `Constraint violated on ${t}` }));
      }
    }
    // 3. Unhandled Standard Errors
    else if (exception instanceof Error) {
      this.logger.error(`[${requestId}] Uncaught Error: ${exception.message}`, exception.stack);
      message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred.' 
        : exception.message;
    }

    // Structured logging
    this.logger.warn(
      `[${requestId}] ${request.method} ${request.url} -> ${status} [${code}] ${message}`,
    );

    const errorPayload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        requestId,
      },
    };

    response.status(status).json(errorPayload);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'HTTP_ERROR';
    }
  }
}
