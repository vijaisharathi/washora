import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '@prisma/client';
import { AuthRepository } from '../auth.repository';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../services/token.service';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
  AuthErrorCode,
} from '../types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
        message: 'Authorization header is missing or malformed.',
      });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
        message: 'Invalid Bearer token format.',
      });
    }

    // 1. Verify Access Token
    const payload = this.tokenService.verifyAccessToken(token);

    // 2. Verify Session State
    const session = await this.authRepository.findSessionById(payload.sid);
    if (!session) {
      throw new UnauthorizedException({
        code: AuthErrorCode.SESSION_REVOKED,
        message: 'Session not found.',
      });
    }

    if (session.revokedAt) {
      throw new UnauthorizedException({
        code: AuthErrorCode.SESSION_REVOKED,
        message: 'Session has been revoked.',
      });
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: AuthErrorCode.SESSION_EXPIRED,
        message: 'Session has expired.',
      });
    }

    // 3. Verify User State
    const user = session.user;
    if (!user) {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'User associated with session no longer exists.',
      });
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_SUSPENDED,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_INACTIVE,
        message: 'Your account is inactive.',
      });
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_PENDING,
        message: 'Your account is pending verification.',
      });
    }

    // 4. Attach Identity Context
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    request.user = authenticatedUser;
    request.sessionId = session.id;

    // Asynchronously update last used timestamp without blocking request
    this.authRepository.updateSessionLastUsed(session.id).catch(() => {});

    return true;
  }
}
