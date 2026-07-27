import { Injectable } from '@nestjs/common';

import { GetUserRolesDto, GetUserRolesResultDto } from '@application/dto';
import { SystemRole, UserRole } from '@domain/entities';

@Injectable()
export class GetUserRolesUseCase {
  async execute(input: GetUserRolesDto): Promise<GetUserRolesResultDto> {
    const roles = this.resolveRoles(input.actorSystemRole);

    return {
      roles: roles.map((role) => ({ role })),
    };
  }

  private resolveRoles(actorSystemRole: SystemRole): UserRole[] {
    const baseRoles: UserRole[] = [UserRole.ADMIN, UserRole.STAFF];

    if (this.isMasterRole(actorSystemRole)) {
      return [UserRole.MASTER_ADMIN, UserRole.MASTER_STAFF, ...baseRoles];
    }

    return baseRoles;
  }

  private isMasterRole(systemRole: SystemRole): boolean {
    return systemRole === SystemRole.MASTER_ADMIN;
  }
}
