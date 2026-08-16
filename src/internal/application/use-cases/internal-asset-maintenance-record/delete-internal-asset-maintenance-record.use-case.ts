import { Inject, Injectable } from '@nestjs/common';

import { DeleteInternalAssetMaintenanceRecordDto } from '@application/dto';
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
    await this.writeRepository.update(record);
  }
}
