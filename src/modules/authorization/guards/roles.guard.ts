import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthorizationService } from '../services/authorization.service';
import {
  AuthorizationErrorCode,
  AuthorizedRequest,
} from '../types/authorization.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authzService: AuthorizationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const orgContext = request.organization;

    if (!orgContext) {
      throw new ForbiddenException({
        code: AuthorizationErrorCode.ORGANIZATION_CONTEXT_REQUIRED,
        message: 'Organization context must be resolved before role evaluation.',
      });
    }

    const hasRequiredRole = this.authzService.hasRole(
      orgContext,
      ...requiredRoles,
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException({
        code: AuthorizationErrorCode.ROLE_ACCESS_DENIED,
        message: 'You do not have the required role to access this resource.',
      });
    }

    return true;
  }
}
