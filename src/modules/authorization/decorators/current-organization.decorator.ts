import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OrganizationContext } from '../types/authorization.types';

export const CurrentOrganization = createParamDecorator(
  (data: keyof OrganizationContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const org = request.organization as OrganizationContext;

    if (!org) {
      return null;
    }

    return data ? org[data] : org;
  },
);
