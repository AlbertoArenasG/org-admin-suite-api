import { Inject, Injectable } from '@nestjs/common';

import {
  CreateInternalAssetMaintenanceRecordDto,
  CreateInternalAssetMaintenanceRecordResultDto,
} from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import { InternalAssetMaintenanceRecord } from '@domain/entities';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalAssetMaintenanceRecordWriteRepository,
  IInternalAssetMaintenanceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import { normalizeInternalAssetMaintenanceRecordInput } from './internal-asset-maintenance-record.shared';

@Injectable()
export class CreateInternalAssetMaintenanceRecordUseCase {
  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalAssetMaintenanceRecordWriteRepositoryToken)
    private readonly writeRepository: IInternalAssetMaintenanceRecordWriteRepository,
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly expirationStatusPolicyReadRepository: IExpirationStatusPolicyReadRepository,
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly expirationNotificationPolicyReadRepository: IExpirationNotificationPolicyReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    input: CreateInternalAssetMaintenanceRecordDto,
  ): Promise<CreateInternalAssetMaintenanceRecordResultDto> {
    const normalized = await normalizeInternalAssetMaintenanceRecordInput(
      input,
      {
        expirationStatusPolicyReadRepository:
          this.expirationStatusPolicyReadRepository,
        expirationNotificationPolicyReadRepository:
          this.expirationNotificationPolicyReadRepository,
      },
    );

    const record = new InternalAssetMaintenanceRecord({
      ...normalized,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { data } = await this.writeRepository.create(record);
    const policiesById = await this.readRepository.findPoliciesByIds({
      expirationStatusPolicyIds: normalized.expirationStatusPolicyId
        ? [normalized.expirationStatusPolicyId]
        : [],
      expirationNotificationPolicyIds: normalized.expirationNotificationPolicyId
        ? [normalized.expirationNotificationPolicyId]
        : [],
    });
    const createdBy = await this.auditUserFetcher.fetchAuditUser(
      input.actorUserId,
    );

    return InternalAssetMaintenanceRecordMapper.toViewDto(data!, {
      ...policiesById,
      createdBy,
      updatedBy: createdBy,
    });
  }
}
