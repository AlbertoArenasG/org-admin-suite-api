import { Inject, Injectable } from '@nestjs/common';

import { CreateRoleDto, CreateRoleResultDto } from '@application/dto';
import { RoleMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { Role, RoleScope } from '@domain/entities';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IRoleWriteRepository,
  IRoleWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IRoleWriteRepositoryToken)
    private readonly roleWriteRepository: IRoleWriteRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(input: CreateRoleDto): Promise<CreateRoleResultDto> {
    const code = this.generateCode(input.name);

    await this.ensureNameUnique(input.name);
    await this.ensureCodeUnique(code);

    const role = new Role({
      name: input.name,
      code,
      scope: RoleScope.USER,
      isSystem: false,
      isImmutable: false,
      isDefault: false,
      permissions: input.permissions,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { data } = await this.roleWriteRepository.create(role);

    const createdByUser = await this.auditUserFetcher.fetchAuditUser(
      input.actorUserId,
    );

    return RoleMapper.toViewDto(data!, createdByUser, createdByUser);
  }

  private async ensureNameUnique(name: string): Promise<void> {
    const { data } = await this.roleReadRepository.findByName(name);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.ROLE_NAME,
        { name },
      );
    }
  }

  private async ensureCodeUnique(code: string): Promise<void> {
    const { data } = await this.roleReadRepository.findByCode(code);

    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.ROLE_CODE,
        { code },
      );
    }
  }

  private generateCode(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
      .toUpperCase();
  }
}
