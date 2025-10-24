import { Injectable } from '@nestjs/common';

import { GetUserRolesDto, GetUserRolesResultDto } from '@application/dto';
import { UserRole } from '@domain/entities';

@Injectable()
export class GetUserRolesUseCase {
  async execute(input: GetUserRolesDto): Promise<GetUserRolesResultDto> {
    const roles = this.resolveRoles(input.actorRole);

    return {
      roles: roles.map((role) => ({ role })),
    };
  }

  private resolveRoles(actorRole: UserRole): UserRole[] {
    const baseRoles: UserRole[] = [
      UserRole.ADMIN,
      UserRole.STAFF,
      UserRole.CUSTOMER,
    ];

    if (this.isMasterRole(actorRole)) {
      return [UserRole.MASTER_ADMIN, UserRole.MASTER_STAFF, ...baseRoles];
    }

    return baseRoles;
  }

  private isMasterRole(role: UserRole): boolean {
    return role === UserRole.MASTER_ADMIN || role === UserRole.MASTER_STAFF;
  }
}
