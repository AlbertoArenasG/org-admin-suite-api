import { Inject, Injectable } from '@nestjs/common';

import {
  GetAssignableRolesDto,
  GetAssignableRolesResultDto,
} from '@application/dto';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';
import { Role, RoleScope, SystemRole } from '@domain/entities';

@Injectable()
export class GetAssignableRolesUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  async execute(
    input: GetAssignableRolesDto,
  ): Promise<GetAssignableRolesResultDto> {
    const roles = await this.resolveRoles(input.actorSystemRole);

    return {
      roles: roles.map((role) => ({
        roleId: role.id,
        code: role.code,
        name: role.name,
        systemRole: this.mapScopeToSystemRole(role.scope),
        scope: role.scope,
        isSystem: role.isSystem,
        isDefault: role.isDefault,
      })),
    };
  }

  private async resolveRoles(actorSystemRole: SystemRole): Promise<Role[]> {
    const customUserRoles = await this.findCustomUserRoles(actorSystemRole);

    if (actorSystemRole === SystemRole.MASTER_ADMIN) {
      const [masterDefaultRole, adminDefaultRole] = await Promise.all([
        this.findDefaultRole(RoleScope.MASTER_ADMIN),
        this.findDefaultRole(RoleScope.ADMIN),
      ]);

      return [masterDefaultRole, adminDefaultRole, ...customUserRoles].filter(
        (role): role is Role => role !== null,
      );
    }

    if (actorSystemRole === SystemRole.ADMIN) {
      const adminDefaultRole = await this.findDefaultRole(RoleScope.ADMIN);

      return [adminDefaultRole, ...customUserRoles].filter(
        (role): role is Role => role !== null,
      );
    }

    return customUserRoles;
  }

  private async findDefaultRole(scope: RoleScope): Promise<Role | null> {
    const { data } = await this.roleReadRepository.findDefaultByScope(scope);
    return data;
  }

  private mapScopeToSystemRole(scope: RoleScope): SystemRole {
    switch (scope) {
      case RoleScope.MASTER_ADMIN:
        return SystemRole.MASTER_ADMIN;
      case RoleScope.ADMIN:
        return SystemRole.ADMIN;
      case RoleScope.USER:
        return SystemRole.USER;
    }
  }

  private async findCustomUserRoles(
    actorSystemRole: SystemRole,
  ): Promise<Role[]> {
    const { data } = await this.roleReadRepository.findAll({
      page: 1,
      perPage: 1000,
      actorSystemRole,
      scope: RoleScope.USER,
      status: null,
      isSystem: false,
      search: null,
      sorts: [
        { field: 'name', direction: 'asc' },
        { field: 'created_at', direction: 'asc' },
      ],
    });

    return data;
  }
}
