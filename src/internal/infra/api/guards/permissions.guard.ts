import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedUserContextDto } from '@application/dto';
import { AuthorizationService } from '@application/services';
import {
  PERMISSION_METADATA_KEY,
  RequiredPermissionMetadata,
} from '@src/common/decorators';
import { AuthorizationException } from '@domain/exceptions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<
      RequiredPermissionMetadata | undefined
    >(PERMISSION_METADATA_KEY, [context.getHandler(), context.getClass()]);

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authContext = request.authContext as
      | AuthenticatedUserContextDto
      | undefined;

    if (!authContext) {
      throw AuthorizationException.authContextMissing();
    }

    await this.authorizationService.ensurePermission(
      authContext,
      permission.module,
      permission.operation,
    );

    return true;
  }
}
