import { Inject, Injectable } from '@nestjs/common';

import { DeleteExpirationNotificationPolicyDto } from '@application/dto';
import { InternalAssetNotificationMaterializationRefresher } from '@application/services';
import { isRecordOperational } from '@application/services/internal-asset-maintenance';
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
    private readonly notificationMaterializationRefresher: InternalAssetNotificationMaterializationRefresher,
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
    for (const record of affectedRecords) {
      await this.internalAssetMaintenanceRecordWriteRepository.updateSystemManagedFields(
        {
          recordId: record.id,
          expirationNotificationPolicyId: null,
          ...(isRecordOperational(record.status)
            ? {
                expirationNotificationMaterialization:
                  this.notificationMaterializationRefresher.refresh({
                    record,
                    policy: null,
                  }),
              }
            : {}),
        },
      );
    }
  }
}
