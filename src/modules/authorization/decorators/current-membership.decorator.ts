import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MemberSummary } from '../types/authorization.types';

export const CurrentMembership = createParamDecorator(
  (data: keyof MemberSummary | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const membership = request.membership as MemberSummary;

    if (!membership) {
      return null;
    }

    return data ? membership[data] : membership;
  },
);
