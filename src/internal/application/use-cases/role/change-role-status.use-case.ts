import { Inject, Injectable } from '@nestjs/common';

import { RoleMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  ChangeRoleStatusDto,
  ChangeRoleStatusResultDto,
} from '@application/dto';
import { RoleStatus } from '@domain/entities';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IRoleWriteRepository,
  IRoleWriteRepositoryToken,
} from '@domain/ports/repositories';
import { RoleMutationPolicy } from './shared/role-mutation-policy';

@Injectable()
export class ChangeRoleStatusUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IRoleWriteRepositoryToken)
    private readonly roleWriteRepository: IRoleWriteRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    input: ChangeRoleStatusDto,
  ): Promise<ChangeRoleStatusResultDto> {
    const { roleId, actorUserId, status } = input;

    const { data } = await this.roleReadRepository.findById(roleId);
    const role = RoleMutationPolicy.ensureExists(data, roleId);

    RoleMutationPolicy.ensureMutable(role);

    if (status === RoleStatus.ACTIVE) {
      role.activate(actorUserId);
    } else {
      role.deactivate(actorUserId);
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
