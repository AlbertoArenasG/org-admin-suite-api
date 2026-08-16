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
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  applyInternalAssetMaintenanceRecordMaterializations,
  collectProviderFollowUpRecipientGroupIds,
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
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
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
        recipientGroupReadRepository: this.recipientGroupReadRepository,
      },
    );
    const normalizedWithFollowUpHistory = {
      ...normalized,
      providerFollowUp: normalized.providerFollowUp
        ? {
            ...normalized.providerFollowUp,
            lastSentAt: record.providerFollowUp?.lastSentAt ?? null,
          }
        : null,
    };

    record.updateDetails(normalizedWithFollowUpHistory, input.actorUserId);

    const [expirationStatusPolicy, expirationNotificationPolicy] =
      await Promise.all([
        normalizedWithFollowUpHistory.expirationStatusPolicyId
          ? this.expirationStatusPolicyReadRepository
              .findById(normalizedWithFollowUpHistory.expirationStatusPolicyId)
              .then((result) => result.data)
          : Promise.resolve<ExpirationStatusPolicy | null>(null),
        normalizedWithFollowUpHistory.expirationNotificationPolicyId
          ? this.expirationNotificationPolicyReadRepository
              .findById(
                normalizedWithFollowUpHistory.expirationNotificationPolicyId,
              )
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
      expirationStatusPolicyIds:
        normalizedWithFollowUpHistory.expirationStatusPolicyId
          ? [normalizedWithFollowUpHistory.expirationStatusPolicyId]
          : [],
      expirationNotificationPolicyIds:
        normalizedWithFollowUpHistory.expirationNotificationPolicyId
          ? [normalizedWithFollowUpHistory.expirationNotificationPolicyId]
          : [],
    });
    const { data: recipientGroups } =
      await this.recipientGroupReadRepository.findByIds(
        collectProviderFollowUpRecipientGroupIds(data ? [data] : []),
      );
    const [createdBy, updatedBy] = await Promise.all([
      this.auditUserFetcher.fetchAuditUser(record.createdBy),
      this.auditUserFetcher.fetchAuditUser(input.actorUserId),
    ]);

    return InternalAssetMaintenanceRecordMapper.toViewDto(data!, {
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
