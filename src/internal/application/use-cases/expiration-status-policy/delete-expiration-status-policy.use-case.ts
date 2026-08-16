import { Inject, Injectable } from '@nestjs/common';

import { DeleteExpirationStatusPolicyDto } from '@application/dto';
import {
  applyInternalAssetMaintenanceRecordMaterializations,
  collectPolicyIds,
} from '@application/use-cases/internal-asset-maintenance-record/internal-asset-maintenance-record.shared';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
  IExpirationStatusPolicyWriteRepository,
  IExpirationStatusPolicyWriteRepositoryToken,
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalAssetMaintenanceRecordWriteRepository,
  IInternalAssetMaintenanceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class DeleteExpirationStatusPolicyUseCase {
  constructor(
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly readRepository: IExpirationStatusPolicyReadRepository,
    @Inject(IExpirationStatusPolicyWriteRepositoryToken)
    private readonly writeRepository: IExpirationStatusPolicyWriteRepository,
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly internalAssetMaintenanceRecordReadRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalAssetMaintenanceRecordWriteRepositoryToken)
    private readonly internalAssetMaintenanceRecordWriteRepository: IInternalAssetMaintenanceRecordWriteRepository,
  ) {}

  async execute(input: DeleteExpirationStatusPolicyDto): Promise<void> {
    const { data } = await this.readRepository.findById(
      input.expirationStatusPolicyId,
    );

    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_STATUS_POLICY,
        { expirationStatusPolicyId: input.expirationStatusPolicyId },
      );
    }

    data.markAsDeleted(input.actorUserId);
    const { data: deletedPolicy } = await this.writeRepository.update(data);
    const { data: affectedRecords } =
      await this.internalAssetMaintenanceRecordReadRepository.findByExpirationStatusPolicyId(
        deletedPolicy!.id,
      );
    const policiesById =
      await this.internalAssetMaintenanceRecordReadRepository.findPoliciesByIds(
        collectPolicyIds(affectedRecords),
      );

    for (const record of affectedRecords) {
      record.updateDetails(
        { expirationStatusPolicyId: null },
        input.actorUserId,
      );
      applyInternalAssetMaintenanceRecordMaterializations({
        record,
        expirationStatusPolicy: null,
        expirationNotificationPolicy:
          record.expirationNotificationPolicyId != null
            ? (policiesById.expirationNotificationPoliciesById.get(
                record.expirationNotificationPolicyId,
              ) ?? null)
            : null,
        actorUserId: input.actorUserId,
      });
      await this.internalAssetMaintenanceRecordWriteRepository.update(record);
    }
  }
}
