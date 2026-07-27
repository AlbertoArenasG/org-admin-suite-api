import { Inject, Injectable } from '@nestjs/common';

import {
  AuthenticatedRoleMetadataDto,
  AuthenticatedUserContextDto,
  GetMyPermissionsResultDto,
} from '@application/dto';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';
import { AuthorizationException } from '@domain/exceptions';
import { Role, RoleScope, SystemRole } from '@domain/entities';

export interface PermissionActorDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string | null;
}

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  async ensurePermission(
    actor: AuthenticatedUserContextDto | PermissionActorDto,
    module: string,
    operation: string,
  ): Promise<void> {
    const allowed = await this.hasPermission(actor, module, operation);

    if (!allowed) {
      throw AuthorizationException.rolePrivilegesInsufficient(actor.systemRole);
    }
  }

  async hasPermission(
    actor: AuthenticatedUserContextDto | PermissionActorDto,
    module: string,
    operation: string,
  ): Promise<boolean> {
    const context = await this.resolveEffectivePermissions(actor);

    return context.permissions.some(
      (permission) =>
        permission.module === module && permission.operation === operation,
    );
  }

  async resolveEffectivePermissions(
    actor: AuthenticatedUserContextDto | PermissionActorDto,
  ): Promise<GetMyPermissionsResultDto> {
    const role = await this.resolveRole(actor);

    return {
      systemRole: actor.systemRole,
      role: role ? this.toRoleMetadata(role) : null,
      permissions:
        role?.permissions.map((permission) => ({
          module: permission.module,
          operation: permission.operation,
        })) ?? [],
    };
  }

  private async resolveRole(actor: PermissionActorDto): Promise<Role | null> {
    if (actor.roleId) {
      const { data } = await this.roleReadRepository.findById(actor.roleId);

      if (data) {
        return data;
      }
    }

    if (actor.systemRole === SystemRole.MASTER_ADMIN) {
      const { data } = await this.roleReadRepository.findDefaultByScope(
        RoleScope.MASTER_ADMIN,
      );

      return data ?? null;
    }

    if (actor.systemRole === SystemRole.ADMIN) {
      const { data } = await this.roleReadRepository.findDefaultByScope(
        RoleScope.ADMIN,
      );

      return data ?? null;
    }

    const { data } = await this.roleReadRepository.findByCode('STAFF_LEGACY');

    return data ?? null;
  }

  private toRoleMetadata(role: Role): AuthenticatedRoleMetadataDto {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      scope: role.scope,
      isSystem: role.isSystem,
      isDefault: role.isDefault,
      isImmutable: role.isImmutable,
      status: role.status,
    };
  }
}
