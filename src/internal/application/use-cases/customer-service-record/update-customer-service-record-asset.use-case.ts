import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordAssetDto,
  UpdateCustomerServiceRecordAssetResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import { CustomerServiceRecordAttachmentReconciliationService } from '@application/services';
import { CustomerServiceRecordFileAttachmentCollectionProps } from '@domain/entities';
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
    this.assertHasUpdate(input);
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
        this.reconcileCollection(
          existingAsset.intakeConditionFiles!,
          input.intakeConditionFileIds,
          input.actorUserId,
        ),
        this.reconcileCollection(
          existingAsset.deliveryConditionFiles!,
          input.deliveryConditionFileIds,
          input.actorUserId,
        ),
        this.reconcileCollection(
          existingAsset.reports!,
          input.reportFileIds,
          input.actorUserId,
        ),
      ]);
    const normalizedAsset = normalizeAssets([
      {
        name: input.name ?? existingAsset.name,
        identifier: input.identifier ?? existingAsset.identifier,
        brand: input.brand ?? existingAsset.brand,
        model: input.model ?? existingAsset.model,
        serialNumber: input.serialNumber ?? existingAsset.serialNumber,
        observations:
          input.observations === undefined
            ? existingAsset.observations
            : input.observations,
      },
    ])[0];
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

  private assertHasUpdate(input: UpdateCustomerServiceRecordAssetDto): void {
    const hasUpdate = [
      input.name,
      input.identifier,
      input.brand,
      input.model,
      input.serialNumber,
      input.observations,
      input.intakeConditionFileIds,
      input.deliveryConditionFileIds,
      input.reportFileIds,
    ].some((value) => value !== undefined);
    if (!hasUpdate)
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'asset',
        reason: 'EMPTY_UPDATE',
      });
  }

  private async reconcileCollection(
    collection: CustomerServiceRecordFileAttachmentCollectionProps,
    fileIds: string[] | undefined,
    actorUserId: string,
  ) {
    if (fileIds === undefined) return collection;
    return this.attachmentReconciliation.reconcile({
      collection,
      fileIds,
      actorUserId,
    });
  }
}
