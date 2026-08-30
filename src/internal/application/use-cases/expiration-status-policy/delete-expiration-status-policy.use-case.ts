import { Inject, Injectable } from '@nestjs/common';

import { DeleteExpirationStatusPolicyDto } from '@application/dto';
import {
  CustomerServiceRecordTechnicalMaterializationsRefresherService,
  InternalAssetStatusMaterializationRefresher,
} from '@application/services';
import { isRecordOperational } from '@application/services/internal-asset-maintenance';
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
    private readonly statusMaterializationRefresher: InternalAssetStatusMaterializationRefresher,
    private readonly customerServiceRecordMaterializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
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
    for (const record of affectedRecords) {
      await this.internalAssetMaintenanceRecordWriteRepository.updateSystemManagedFields(
        {
          recordId: record.id,
          expirationStatusPolicyId: null,
          ...(isRecordOperational(record.status)
            ? {
                expirationStatusMaterialization:
                  this.statusMaterializationRefresher.refresh({
                    record,
                    policy: null,
                  }),
              }
            : {}),
        },
      );
    }
    await Promise.all([
      this.customerServiceRecordMaterializationsRefresher.refreshOperational({
        commitment: 'CUSTOMER_DELIVERY',
        statusPolicyId: deletedPolicy!.id,
        customerDeliveryStatus: true,
        customerDeliveryNotification: false,
        providerStatus: false,
        providerNotification: false,
        providerFollowUp: false,
      }),
      this.customerServiceRecordMaterializationsRefresher.refreshOperational({
        commitment: 'PROVIDER_RETURN',
        statusPolicyId: deletedPolicy!.id,
        customerDeliveryStatus: false,
        customerDeliveryNotification: false,
        providerStatus: true,
        providerNotification: false,
        providerFollowUp: false,
      }),
    ]);
  }
}
