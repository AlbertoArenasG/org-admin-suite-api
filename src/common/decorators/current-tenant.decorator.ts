import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import {
  AuthenticatedActorDto,
  AuthenticatedActorType,
  AuthenticatedTenantDto,
} from '@application/dto';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedTenantDto | null => {
    const request = ctx.switchToHttp().getRequest();
    const actor = request.authActor as AuthenticatedActorDto | undefined;

    if (actor?.type === AuthenticatedActorType.TENANT) {
      return actor as AuthenticatedTenantDto;
    }

    return null;
  },
);
