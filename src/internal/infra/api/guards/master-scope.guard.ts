import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedUserContextDto } from '@application/dto';
import {
  SCOPE_METADATA_KEY,
  ScopeType,
} from '@src/common/decorators/scopes.decorator';
import { SystemRole } from '@domain/entities';
import { AuthorizationException } from '@domain/exceptions';

@Injectable()
export class MasterScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.requiresMasterScope(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authContext = request.authContext as
      | AuthenticatedUserContextDto
      | undefined;

    if (!authContext || authContext.systemRole !== SystemRole.MASTER_ADMIN) {
      throw AuthorizationException.masterPrivilegesRequired();
    }

    return true;
  }

  private requiresMasterScope(context: ExecutionContext): boolean {
    const scopes = this.reflector.getAllAndOverride<ScopeType[] | undefined>(
      SCOPE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!scopes || !scopes.length) {
      return true;
    }

    return scopes.includes('MASTER');
  }
}
