import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedActorDto } from '@application/dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedActorDto => {
    const request = ctx.switchToHttp().getRequest();
    const actor = request.authActor;

    if (!actor) {
      throw new Error(
        'CurrentUser decorator used without an authenticated actor context',
      );
    }

    return actor;
  },
);
