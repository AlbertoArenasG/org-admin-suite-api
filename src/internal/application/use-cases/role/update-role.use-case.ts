import { Inject, Injectable } from '@nestjs/common';

import { RoleMapper } from '@application/mappers';
import {
  AuditUserFetcherService,
  AuxiliaryCapabilitiesService,
} from '@application/services';
import { UpdateRoleDto, UpdateRoleResultDto } from '@application/dto';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IRoleWriteRepository,
  IRoleWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  isValidAuthorizationPermission,
  normalizeAuthorizationPermission,
} from '@application/services/authz/authorization-catalog.utils';
import { RoleMutationPolicy } from './shared/role-mutation-policy';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IRoleWriteRepositoryToken)
    private readonly roleWriteRepository: IRoleWriteRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
    private readonly auxiliaryCapabilitiesService: AuxiliaryCapabilitiesService,
  ) {}

  async execute(input: UpdateRoleDto): Promise<UpdateRoleResultDto> {
    const { roleId, actorUserId, permissions } = input;

    const { data } = await this.roleReadRepository.findById(roleId);
    const role = RoleMutationPolicy.ensureExists(data, roleId);

    RoleMutationPolicy.ensureMutable(role);

    if (permissions !== undefined) {
      const normalizedPermissions = permissions.map((permission) => {
        const normalized = normalizeAuthorizationPermission(permission);

        if (
          !isValidAuthorizationPermission(
            normalized.module,
            normalized.operation,
          )
        ) {
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

        return normalized;
      });

      const auxiliaryCapabilities =
        this.auxiliaryCapabilitiesService.deriveFromPermissions(
          normalizedPermissions,
        );

      role.replacePermissions(normalizedPermissions, actorUserId);
      role.replaceAuxiliaryCapabilities(auxiliaryCapabilities, actorUserId);
    }

    const { data: updated } = await this.roleWriteRepository.update(role);
    const ensuredRole = RoleMutationPolicy.ensureExists(updated, roleId);
    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: ensuredRole.createdBy,
        updatedBy: ensuredRole.updatedBy,
      });

    return RoleMapper.toViewDto(ensuredRole, createdByUser, updatedByUser);
  }
}
