import { Inject, Injectable } from '@nestjs/common';

import { GetInternalAssetMaintenanceRecordByIdResultDto } from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';
import { collectProviderFollowUpRecipientGroupIds } from './internal-asset-maintenance-record.shared';

@Injectable()
export class GetInternalAssetMaintenanceRecordByIdUseCase {
  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    recordId: string,
  ): Promise<GetInternalAssetMaintenanceRecordByIdResultDto> {
    const { data: record } = await this.readRepository.findById(recordId);

    if (!record) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        entity: 'internal_asset_maintenance_record',
        recordId,
      });
    }

    const policiesById = await this.readRepository.findPoliciesByIds({
      expirationStatusPolicyIds: record.expirationStatusPolicyId
        ? [record.expirationStatusPolicyId]
        : [],
      expirationNotificationPolicyIds: record.expirationNotificationPolicyId
        ? [record.expirationNotificationPolicyId]
        : [],
    });
    const { data: recipientGroups } =
      await this.recipientGroupReadRepository.findByIds(
        collectProviderFollowUpRecipientGroupIds([record]),
      );
    const [createdBy, updatedBy] = await Promise.all([
      this.auditUserFetcher.fetchAuditUser(record.createdBy),
      this.auditUserFetcher.fetchAuditUser(record.updatedBy),
    ]);

    return InternalAssetMaintenanceRecordMapper.toViewDto(record, {
      ...policiesById,
      recipientGroupsById: new Map(
        recipientGroups.map((recipientGroup) => [
          recipientGroup.id,
          recipientGroup,
        ]),
      ),
      createdBy,
      updatedBy,
    });
  }
}
