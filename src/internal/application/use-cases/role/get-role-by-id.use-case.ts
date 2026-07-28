import { Inject, Injectable } from '@nestjs/common';

import { GetRoleByIdResultDto } from '@application/dto';
import { RoleMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(roleId: string): Promise<GetRoleByIdResultDto> {
    const { data: role } = await this.roleReadRepository.findById(roleId);

    if (!role) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.ROLE, {
        roleId,
      });
    }

    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: role.createdBy,
        updatedBy: role.updatedBy,
      });

    return RoleMapper.toViewDto(role, createdByUser, updatedByUser);
  }
}
