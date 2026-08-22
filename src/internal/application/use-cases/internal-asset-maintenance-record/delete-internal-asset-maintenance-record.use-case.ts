import { Inject, Injectable } from '@nestjs/common';

import { DeleteInternalAssetMaintenanceRecordDto } from '@application/dto';
import {
  InternalAssetNotificationMaterializationRefresher,
  InternalAssetStatusMaterializationRefresher,
} from '@application/services';
import { applyInternalAssetMaintenanceRecordMaterializations } from './internal-asset-maintenance-record.shared';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalAssetMaintenanceRecordWriteRepository,
  IInternalAssetMaintenanceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class DeleteInternalAssetMaintenanceRecordUseCase {
  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalAssetMaintenanceRecordWriteRepositoryToken)
    private readonly writeRepository: IInternalAssetMaintenanceRecordWriteRepository,
    private readonly statusMaterializationRefresher: InternalAssetStatusMaterializationRefresher,
    private readonly notificationMaterializationRefresher: InternalAssetNotificationMaterializationRefresher,
  ) {}

  async execute(input: DeleteInternalAssetMaintenanceRecordDto): Promise<void> {
    const { data: record } = await this.readRepository.findById(input.recordId);

    if (!record) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.FILE, {
        entity: 'internal_asset_maintenance_record',
        recordId: input.recordId,
      });
    }

    record.markAsDeleted(input.actorUserId);
    applyInternalAssetMaintenanceRecordMaterializations({
      record,
      materializations: {
        expirationStatusMaterialization:
          this.statusMaterializationRefresher.refresh({ record, policy: null }),
        expirationNotificationMaterialization:
          this.notificationMaterializationRefresher.refresh({
            record,
            policy: null,
          }),
      },
      actorUserId: input.actorUserId,
    });
    await this.writeRepository.update(record);
  }
}
