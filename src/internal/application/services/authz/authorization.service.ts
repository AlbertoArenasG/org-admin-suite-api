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
import {
  AuthorizationException,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import { Role, RoleScope, RoleStatus, SystemRole } from '@domain/entities';
import {
  getAuthorizationModule,
  getAuthorizationOperation,
  isValidAuthorizationPermission,
  normalizeAuthorizationPermission,
} from './authorization-catalog.utils';

export interface PermissionActorDto {
  userId: string;
  systemRole: SystemRole;
  roleId: string | null;
}

export interface AuthorizationUserTargetDto {
  systemRole: SystemRole;
  roleId: string | null;
}

const SYSTEM_ROLE_RANK: Record<SystemRole, number> = {
  [SystemRole.MASTER_ADMIN]: 0,
  [SystemRole.ADMIN]: 1,
  [SystemRole.USER]: 2,
};

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
    const requestedPermission = normalizeAuthorizationPermission({
      module,
      operation,
    });

    return context.permissions.some(
      (permission) =>
        permission.module === requestedPermission.module &&
        permission.operation === requestedPermission.operation,
    );
  }

  async resolveEffectivePermissions(
    actor: AuthenticatedUserContextDto | PermissionActorDto,
  ): Promise<GetMyPermissionsResultDto> {
    const role = await this.resolveRole(actor);
    const permissions = (role?.permissions ?? [])
      .map((permission) => normalizeAuthorizationPermission(permission))
      .filter((permission) =>
        isValidAuthorizationPermission(permission.module, permission.operation),
      )
      .map((permission) => {
        const module = getAuthorizationModule(permission.module);
        const operation = getAuthorizationOperation(permission.operation);

        if (!module || !operation) {
          throw InvalidValueException.create(
            InvalidValueExceptionCode.DEFAULT,
            {
              field: 'permissions',
              module: permission.module,
              operation: permission.operation,
              reason: 'INVALID_ROLE_PERMISSION',
            },
          );
        }

        return {
          module: permission.module,
          moduleNameKey: module.nameKey,
          operation: permission.operation,
          operationNameKey: operation.nameKey,
        };
      });

    const modules = Array.from(
      new Map(
        permissions.map((permission) => [
          permission.module,
          {
            code: permission.module,
            nameKey: permission.moduleNameKey,
          },
        ]),
      ).values(),
    );

    return {
      systemRole: actor.systemRole,
      role: role ? this.toRoleMetadata(role) : null,
      modules,
      permissions,
    };
  }

  async ensureCanCreateUser(
    actor: AuthenticatedUserContextDto | PermissionActorDto,
    target: AuthorizationUserTargetDto,
  ): Promise<void> {
    this.ensureCanManageTargetSystemRole(actor.systemRole, target.systemRole);
    await this.ensureRoleAssignment(target);
  }

  async ensureCanUpdateUser(
    actor: AuthenticatedUserContextDto | PermissionActorDto,
    input: {
      currentSystemRole: SystemRole;
      nextSystemRole: SystemRole;
      nextRoleId: string | null;
      isSelfUpdate: boolean;
    },
  ): Promise<void> {
    if (!input.isSelfUpdate) {
      this.ensureCanManageTargetSystemRole(
        actor.systemRole,
        input.currentSystemRole,
      );
    }

    this.ensureCanManageTargetSystemRole(
      actor.systemRole,
      input.nextSystemRole,
    );

    await this.ensureRoleAssignment({
      systemRole: input.nextSystemRole,
      roleId: input.nextRoleId,
    });
  }

  ensureCanDeleteUser(
    actorSystemRole: SystemRole,
    targetSystemRole: SystemRole,
    isSelfDelete: boolean,
  ): void {
    if (isSelfDelete) {
      throw AuthorizationException.rolePrivilegesInsufficient(actorSystemRole);
    }

    this.ensureCanManageTargetSystemRole(actorSystemRole, targetSystemRole);
  }

  ensureHasHigherPrivileges(
    actorSystemRole: SystemRole,
    targetSystemRole: SystemRole,
  ): void {
    if (
      SYSTEM_ROLE_RANK[actorSystemRole] >= SYSTEM_ROLE_RANK[targetSystemRole]
    ) {
      throw AuthorizationException.rolePrivilegesInsufficient(actorSystemRole);
    }
  }

  ensureCanManageTargetSystemRole(
    actorSystemRole: SystemRole,
    targetSystemRole: SystemRole,
  ): void {
    if (actorSystemRole === SystemRole.MASTER_ADMIN) {
      return;
    }

    if (
      actorSystemRole === SystemRole.ADMIN &&
      targetSystemRole !== SystemRole.MASTER_ADMIN
    ) {
      return;
    }

    if (
      actorSystemRole === SystemRole.USER &&
      targetSystemRole === SystemRole.USER
    ) {
      return;
    }

    throw AuthorizationException.rolePrivilegesInsufficient(actorSystemRole);
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

  private async ensureRoleAssignment(
    target: AuthorizationUserTargetDto,
  ): Promise<void> {
    if (target.systemRole === SystemRole.MASTER_ADMIN) {
      await this.ensureDefaultSystemRoleAssignment(
        RoleScope.MASTER_ADMIN,
        target,
      );
      return;
    }

    if (target.systemRole === SystemRole.ADMIN) {
      await this.ensureDefaultSystemRoleAssignment(RoleScope.ADMIN, target);
      return;
    }

    if (!target.roleId) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'role_id',
        reason: 'ROLE_ID_REQUIRED_FOR_USER',
      });
    }

    const { data: role } = await this.roleReadRepository.findById(
      target.roleId,
    );

    if (!role || role.status === RoleStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.ROLE, {
        roleId: target.roleId,
      });
    }

    if (role.scope !== RoleScope.USER || role.isSystem) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'role_id',
        reason: 'USER_REQUIRES_CUSTOM_ROLE',
        roleId: target.roleId,
      });
    }
  }

  private async ensureDefaultSystemRoleAssignment(
    scope: RoleScope.MASTER_ADMIN | RoleScope.ADMIN,
    target: AuthorizationUserTargetDto,
  ): Promise<void> {
    if (!target.roleId) {
      return;
    }

    const { data: role } = await this.roleReadRepository.findById(
      target.roleId,
    );

    if (!role || role.status === RoleStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.ROLE, {
        roleId: target.roleId,
      });
    }

    if (
      role.scope !== scope ||
      !role.isSystem ||
      !role.isDefault ||
      !role.isImmutable
    ) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'role_id',
        reason: 'SYSTEM_ROLE_REQUIRES_DEFAULT_ROLE',
        roleId: target.roleId,
        scope,
      });
    }
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
