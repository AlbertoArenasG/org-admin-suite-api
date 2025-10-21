import { Inject, Injectable } from '@nestjs/common';

import {
  ITenantReadRepository,
  ITenantReadRepositoryToken,
  ITenantWriteRepository,
  ITenantWriteRepositoryToken,
} from '@domain/ports/repositories';
import { Tenant, TenantStatus } from '@domain/entities';
import { TenantConfigs } from '@domain/value-objects';
import {
  EntityAlreadyExistsException,
  EntityAlreadyExistsExceptionCode,
} from '@domain/exceptions';
import { CreateTenantDto, CreateTenantResultDto } from '@application/dto';
import { TenantResultMapper } from '@application/mappers';

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject(ITenantReadRepositoryToken)
    private readonly tenantReadRepo: ITenantReadRepository,
    @Inject(ITenantWriteRepositoryToken)
    private readonly tenantWriteRepo: ITenantWriteRepository,
  ) {}

  async execute(input: CreateTenantDto): Promise<CreateTenantResultDto> {
    await this.ensureTenantUnique(input.slug);

    const tenant = new Tenant({
      name: input.name,
      slug: input.slug,
      status: input.status ?? TenantStatus.ACTIVE,
      configs: input.configs ?? TenantConfigs.createDefault(),
    });

    const { data: persisted } = await this.tenantWriteRepo.create(tenant);
    if (!persisted) throw new Error('TENANT_NOT_CREATED');

    if (!persisted.id) {
      throw new Error('TENANT_ID_NOT_AVAILABLE');
    }

    persisted.markAsCreated();

    return TenantResultMapper.toCreateTenantResultDto(persisted);
  }

  private async ensureTenantUnique(slug: string): Promise<void> {
    const { data } = await this.tenantReadRepo.findBySlug(slug);
    if (data) {
      throw EntityAlreadyExistsException.create(
        EntityAlreadyExistsExceptionCode.TENANT_SLUG,
        { slug },
      );
    }
  }
}
