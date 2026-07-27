import { Inject, Injectable } from '@nestjs/common';

import {
  GetMyPermissionsDto,
  GetMyPermissionsResultDto,
} from '@application/dto';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { Role, RoleScope, SystemRole, UserStatus } from '@domain/entities';

@Injectable()
export class GetMyPermissionsUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  async execute(
    input: GetMyPermissionsDto,
  ): Promise<GetMyPermissionsResultDto> {
    const { data: user } = await this.userReadRepository.findById(input.userId);

    if (!user || user.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId: input.userId,
      });
    }

    const role = await this.resolveRole({
      systemRole: user.systemRole,
      roleId: user.roleId ?? input.roleId ?? null,
    });

    return {
      systemRole: user.systemRole,
      role: role
        ? {
            id: role.id,
            code: role.code,
            name: role.name,
            scope: role.scope,
            isSystem: role.isSystem,
            isDefault: role.isDefault,
            isImmutable: role.isImmutable,
            status: role.status,
          }
        : null,
      permissions:
        role?.permissions.map((permission) => ({
          module: permission.module,
          operation: permission.operation,
        })) ?? [],
    };
  }

  private async resolveRole(input: {
    systemRole: SystemRole;
    roleId: string | null;
  }): Promise<Role | null> {
    if (input.roleId) {
      const { data } = await this.roleReadRepository.findById(input.roleId);
      if (data) {
        return data;
      }
    }

    if (input.systemRole === SystemRole.MASTER_ADMIN) {
      const { data } = await this.roleReadRepository.findDefaultByScope(
        RoleScope.MASTER_ADMIN,
      );
      return data ?? null;
    }

    if (input.systemRole === SystemRole.ADMIN) {
      const { data } = await this.roleReadRepository.findDefaultByScope(
        RoleScope.ADMIN,
      );
      return data ?? null;
    }

    const { data } = await this.roleReadRepository.findByCode('STAFF_LEGACY');
    return data ?? null;
  }
}
