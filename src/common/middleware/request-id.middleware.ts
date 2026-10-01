import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingId = req.headers[REQUEST_ID_HEADER] as string;
    const requestId = existingId && existingId.trim().length > 0 
      ? existingId.trim() 
      : `req_${randomUUID().replace(/-/g, '')}`;

    // Attach to request object and response header
    req.headers[REQUEST_ID_HEADER] = requestId;
    (req as any).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
