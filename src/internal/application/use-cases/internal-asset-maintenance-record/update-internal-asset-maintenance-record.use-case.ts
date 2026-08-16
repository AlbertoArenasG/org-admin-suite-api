import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateInternalAssetMaintenanceRecordDto,
  UpdateInternalAssetMaintenanceRecordResultDto,
} from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
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
import {
  applyInternalAssetMaintenanceRecordMaterializations,
  normalizeInternalAssetMaintenanceRecordInput,
} from './internal-asset-maintenance-record.shared';

@Injectable()
export class UpdateInternalAssetMaintenanceRecordUseCase {
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
    input: UpdateInternalAssetMaintenanceRecordDto,
  ): Promise<UpdateInternalAssetMaintenanceRecordResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);

    if (!record) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        entity: 'internal_asset_maintenance_record',
        recordId: input.recordId,
      });
    }

    const normalized = await normalizeInternalAssetMaintenanceRecordInput(
      input,
      {
        expirationStatusPolicyReadRepository:
          this.expirationStatusPolicyReadRepository,
        expirationNotificationPolicyReadRepository:
          this.expirationNotificationPolicyReadRepository,
      },
    );

    record.updateDetails(normalized, input.actorUserId);

    const [expirationStatusPolicy, expirationNotificationPolicy] =
      await Promise.all([
        normalized.expirationStatusPolicyId
          ? this.expirationStatusPolicyReadRepository
              .findById(normalized.expirationStatusPolicyId)
              .then((result) => result.data)
          : Promise.resolve<ExpirationStatusPolicy | null>(null),
        normalized.expirationNotificationPolicyId
          ? this.expirationNotificationPolicyReadRepository
              .findById(normalized.expirationNotificationPolicyId)
              .then((result) => result.data)
          : Promise.resolve<ExpirationNotificationPolicy | null>(null),
      ]);

    applyInternalAssetMaintenanceRecordMaterializations({
      record,
      expirationStatusPolicy,
      expirationNotificationPolicy,
      actorUserId: input.actorUserId,
    });

    const { data } = await this.writeRepository.update(record);

    const policiesById = await this.readRepository.findPoliciesByIds({
      expirationStatusPolicyIds: normalized.expirationStatusPolicyId
        ? [normalized.expirationStatusPolicyId]
        : [],
      expirationNotificationPolicyIds: normalized.expirationNotificationPolicyId
        ? [normalized.expirationNotificationPolicyId]
        : [],
    });
    const [createdBy, updatedBy] = await Promise.all([
      this.auditUserFetcher.fetchAuditUser(record.createdBy),
      this.auditUserFetcher.fetchAuditUser(input.actorUserId),
    ]);

    return InternalAssetMaintenanceRecordMapper.toViewDto(data!, {
      ...policiesById,
      createdBy,
      updatedBy,
    });
  }
}
