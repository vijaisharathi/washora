import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse } from '../types/api-response.type';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | PaginatedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already enveloped (e.g. pagination or custom success envelope)
        if (data && typeof data === 'object') {
          if ('success' in data && data.success === true) {
            return data;
          }
          if ('data' in data && 'meta' in data) {
            return {
              success: true,
              data: data.data,
              meta: data.meta,
            };
          }
        }

        // Standard success wrap
        return {
          success: true,
          data: data !== undefined ? data : null,
        };
      }),
    );
  }
}
