import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedUserContextDto } from '@application/dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUserContextDto => {
    const request = ctx.switchToHttp().getRequest();
    const authContext = request.authContext as
      | AuthenticatedUserContextDto
      | undefined;

    if (!authContext) {
      throw new Error(
        'CurrentUser decorator used without an authenticated context',
      );
    }

    return authContext;
  },
);
