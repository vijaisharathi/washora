import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { AuthorizationService } from '../services/authorization.service';
import { AuthorizedRequest } from '../types/authorization.types';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authzService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();

    if (!request.user || !request.user.id) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication is required before organization resolution.',
      });
    }

    // Extract organization identifier from header
    const rawOrgHeader =
      (request.headers['x-organization-id'] as string) ||
      (request.headers['x-org-id'] as string);

    // Resolve and validate organization context
    const { organization, membership } =
      await this.authzService.resolveOrganizationContext(
        request.user.id,
        rawOrgHeader,
      );

    request.organization = organization;
    request.membership = membership;

    return true;
  }
}
