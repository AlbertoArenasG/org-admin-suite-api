import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedTenantContextDto } from '@application/dto';

export const ActiveTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedTenantContextDto => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.activeTenant as
      | AuthenticatedTenantContextDto
      | undefined
      | null;

    if (!tenant) {
      throw new Error(
        'ActiveTenant decorator used without an active tenant context',
      );
    }

    return tenant;
  },
);
