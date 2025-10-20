import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthenticatedActor, AuthenticatedActorDto } from '@application/dto';
import { UserRole } from '@domain/entities';

const ALLOWED_MASTER_ROLES = new Set<UserRole>([
  UserRole.MASTER_ADMIN,
  UserRole.MASTER_STAFF,
]);

@Injectable()
export class MasterOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const actor = request.authActor as AuthenticatedActorDto | undefined;

    if (!actor || !AuthenticatedActor.isMaster(actor)) {
      throw new ForbiddenException('Master privileges required');
    }

    if (!ALLOWED_MASTER_ROLES.has(actor.role)) {
      throw new ForbiddenException('Master privileges required');
    }

    return true;
  }
}
