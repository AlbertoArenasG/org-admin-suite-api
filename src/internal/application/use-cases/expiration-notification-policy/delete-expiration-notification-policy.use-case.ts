import { Inject, Injectable } from '@nestjs/common';

import { DeleteExpirationNotificationPolicyDto } from '@application/dto';
import {
  applyInternalAssetMaintenanceRecordMaterializations,
  collectPolicyIds,
} from '@application/use-cases/internal-asset-maintenance-record/internal-asset-maintenance-record.shared';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IExpirationNotificationPolicyWriteRepository,
  IExpirationNotificationPolicyWriteRepositoryToken,
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalAssetMaintenanceRecordWriteRepository,
  IInternalAssetMaintenanceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class DeleteExpirationNotificationPolicyUseCase {
  constructor(
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationNotificationPolicyReadRepository,
    @Inject(IExpirationNotificationPolicyWriteRepositoryToken)
    private readonly writeRepository: IExpirationNotificationPolicyWriteRepository,
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly internalAssetMaintenanceRecordReadRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalAssetMaintenanceRecordWriteRepositoryToken)
    private readonly internalAssetMaintenanceRecordWriteRepository: IInternalAssetMaintenanceRecordWriteRepository,
  ) {}

  async execute(input: DeleteExpirationNotificationPolicyDto): Promise<void> {
    const { data } = await this.readRepository.findById(
      input.expirationNotificationPolicyId,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_NOTIFICATION_POLICY,
        {
          expirationNotificationPolicyId: input.expirationNotificationPolicyId,
        },
      );
    }

    data.markAsDeleted(input.actorUserId);
    const { data: deletedPolicy } = await this.writeRepository.update(data);
    const { data: affectedRecords } =
      await this.internalAssetMaintenanceRecordReadRepository.findByExpirationNotificationPolicyId(
        deletedPolicy!.id,
      );
    const policiesById =
      await this.internalAssetMaintenanceRecordReadRepository.findPoliciesByIds(
        collectPolicyIds(affectedRecords),
      );

    for (const record of affectedRecords) {
      record.updateDetails(
        { expirationNotificationPolicyId: null },
        input.actorUserId,
      );
      applyInternalAssetMaintenanceRecordMaterializations({
        record,
        expirationStatusPolicy:
          record.expirationStatusPolicyId != null
            ? (policiesById.expirationStatusPoliciesById.get(
                record.expirationStatusPolicyId,
              ) ?? null)
            : null,
        expirationNotificationPolicy: null,
        actorUserId: input.actorUserId,
      });
      await this.internalAssetMaintenanceRecordWriteRepository.update(record);
    }
  }
}
