import { Inject, Injectable } from '@nestjs/common';

import {
  CreateInternalAssetMaintenanceRecordDto,
  CreateInternalAssetMaintenanceRecordResultDto,
} from '@application/dto';
import { InternalAssetMaintenanceRecordMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  ExpirationNotificationPolicy,
  ExpirationStatusPolicy,
  InternalAssetMaintenanceRecord,
} from '@domain/entities';
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
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
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
        recipientGroupReadRepository: this.recipientGroupReadRepository,
      },
    );

    const record = new InternalAssetMaintenanceRecord({
      ...normalized,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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

    const { data } = await this.writeRepository.create(record);
    const policiesById = await this.readRepository.findPoliciesByIds({
      expirationStatusPolicyIds: normalized.expirationStatusPolicyId
        ? [normalized.expirationStatusPolicyId]
        : [],
      expirationNotificationPolicyIds: normalized.expirationNotificationPolicyId
        ? [normalized.expirationNotificationPolicyId]
        : [],
    });
    const { data: recipientGroups } =
      await this.recipientGroupReadRepository.findByIds(
        collectProviderFollowUpRecipientGroupIds(data ? [data] : []),
      );
    const createdBy = await this.auditUserFetcher.fetchAuditUser(
      input.actorUserId,
    );

    return InternalAssetMaintenanceRecordMapper.toViewDto(data!, {
      ...policiesById,
      recipientGroupsById: new Map(
        recipientGroups.map((recipientGroup) => [
          recipientGroup.id,
          recipientGroup,
        ]),
      ),
      createdBy,
      updatedBy: createdBy,
    });
  }
}
