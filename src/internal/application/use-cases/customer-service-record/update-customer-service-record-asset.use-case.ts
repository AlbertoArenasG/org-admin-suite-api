import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordAssetDto,
  UpdateCustomerServiceRecordAssetResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import { CustomerServiceRecordAttachmentReconciliationService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import { normalizeAssets } from './customer-service-record.shared';

@Injectable()
export class UpdateCustomerServiceRecordAssetUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly attachmentReconciliation: CustomerServiceRecordAttachmentReconciliationService,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordAssetDto,
  ): Promise<UpdateCustomerServiceRecordAssetResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );

    const existingAsset = record.assets.find(
      (asset) => asset.assetId === input.assetId,
    );
    if (!existingAsset)
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'asset_id',
        reason: 'NOT_FOUND',
      });

    const [intakeConditionFiles, deliveryConditionFiles, reports] =
      await Promise.all([
        this.attachmentReconciliation.reconcile({
          collection: existingAsset.intakeConditionFiles!,
          fileIds: input.intakeConditionFileIds,
          actorUserId: input.actorUserId,
        }),
        this.attachmentReconciliation.reconcile({
          collection: existingAsset.deliveryConditionFiles!,
          fileIds: input.deliveryConditionFileIds,
          actorUserId: input.actorUserId,
        }),
        this.attachmentReconciliation.reconcile({
          collection: existingAsset.reports!,
          fileIds: input.reportFileIds,
          actorUserId: input.actorUserId,
        }),
      ]);
    const normalizedAsset = normalizeAssets([input])[0];
    const assets = record.assets.map((asset) =>
      asset.assetId === input.assetId
        ? {
            ...normalizedAsset,
            assetId: asset.assetId,
            intakeConditionFiles,
            deliveryConditionFiles,
            reports,
          }
        : asset,
    );

    record.updateDetails({ assets }, input.actorUserId);
    record.updateDetails(
      this.attachmentReconciliation.calculateCounts(record),
      input.actorUserId,
    );
    const { data } = await this.writeRepository.update(record);
    return CustomerServiceRecordMapper.toViewDto(data!);
  }
}
