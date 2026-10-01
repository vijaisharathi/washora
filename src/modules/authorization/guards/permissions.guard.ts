import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthorizationService } from '../services/authorization.service';
import {
  AuthorizationErrorCode,
  AuthorizedRequest,
} from '../types/authorization.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
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

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const orgContext = request.organization;

    if (!orgContext) {
      throw new ForbiddenException({
        code: AuthorizationErrorCode.ORGANIZATION_CONTEXT_REQUIRED,
        message: 'Organization context must be resolved before permission evaluation.',
      });
    }

    const hasPermissions = this.authzService.hasAllPermissions(
      orgContext,
      requiredPermissions,
    );

    if (!hasPermissions) {
      throw new ForbiddenException({
        code: AuthorizationErrorCode.PERMISSION_DENIED,
        message: 'You do not have permission to perform this action.',
      });
    }

    return true;
  }
}
