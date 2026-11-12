import { Inject, Injectable } from '@nestjs/common';

import {
  ConvertServicePackageRecordDto,
  ConvertServicePackageRecordResultDto,
} from '@application/dto';
import {
  CustomerServiceRecordInputPreparationService,
  CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ServicePackageConversionPhotoService,
} from '@application/services';
import {
  CustomerServiceRecord,
  CustomerServiceRecordFileAttachmentProps,
  CustomerServiceRecordOperationalStatus,
  ServicePackageRecord,
  ServicePackageRecordFileProps,
  ServicePackageRecordStatus,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
  StateConflictException,
  StateConflictExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
  IFileWriteRepository,
  IFileWriteRepositoryToken,
  ISequenceCounterRepository,
  ISequenceCounterRepositoryToken,
  IServicePackageRecordReadRepository,
  IServicePackageRecordReadRepositoryToken,
  IServicePackageRecordWriteRepository,
  IServicePackageRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services';
import { normalizeAssets } from '../customer-service-record/customer-service-record.shared';

interface PreparedItem {
  input: ConvertServicePackageRecordDto['records'][number];
  serviceType: { serviceTypeCode: string; serviceTypeName: string };
  customer: Awaited<
    ReturnType<CustomerServiceRecordInputPreparationService['prepareCustomer']>
  >;
  requestedAt: string;
  receivedAt: string;
  photos: ServicePackageRecordFileProps[];
}

@Injectable()
export class ConvertServicePackageRecordUseCase {
  constructor(
    @Inject(IServicePackageRecordReadRepositoryToken)
    private readonly sourceRead: IServicePackageRecordReadRepository,
    @Inject(IServicePackageRecordWriteRepositoryToken)
    private readonly sourceWrite: IServicePackageRecordWriteRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly targetWrite: ICustomerServiceRecordWriteRepository,
    @Inject(IFileWriteRepositoryToken)
    private readonly fileWrite: IFileWriteRepository,
    @Inject(ISequenceCounterRepositoryToken)
    private readonly sequences: ISequenceCounterRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transactions: ITransactionalExecutor,
    private readonly inputPreparation: CustomerServiceRecordInputPreparationService,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
    private readonly photoService: ServicePackageConversionPhotoService,
  ) {}

  async execute(
    input: ConvertServicePackageRecordDto,
  ): Promise<ConvertServicePackageRecordResultDto> {
    const { data: source } = await this.sourceRead.findById(
      input.sourceRecordId,
    );
    if (!source) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.SERVICE_PACKAGE_RECORD,
      );
    }
    if (source.status !== ServicePackageRecordStatus.ACTIVE) {
      throw StateConflictException.create(
        StateConflictExceptionCode.SERVICE_PACKAGE_RECORD_NOT_ACTIVE,
      );
    }
    if (source.convertedToCustomerServiceRecords) {
      throw StateConflictException.create(
        StateConflictExceptionCode.SERVICE_PACKAGE_RECORD_ALREADY_CONVERTED,
      );
    }
    const prepared = await this.prepare(input, source);
    const photos = await this.photoService.prepare({
      sourceRecordId: source.id,
      actorUserId: input.actorUserId,
      items: prepared.map((item) => ({
        equipmentIndex: item.input.equipmentIndex,
        photos: item.photos,
      })),
    });
    return this.transactions.execute(async () => {
      const claimed = await this.sourceWrite.markConvertedIfAvailable(
        source.id,
      );
      if (!claimed) {
        throw StateConflictException.create(
          StateConflictExceptionCode.SERVICE_PACKAGE_RECORD_ALREADY_CONVERTED,
        );
      }
      for (const item of photos) {
        await this.fileWrite.create(item.file);
      }
      const result: ConvertServicePackageRecordResultDto = {
        sourceRecordId: source.id,
        serviceOrder: source.serviceOrder,
        records: [],
      };
      for (const item of prepared) {
        const serviceNumber = await this.sequences.nextValue(
          'customer_service_records',
        );
        const files = photos
          .filter((copy) => copy.equipmentIndex === item.input.equipmentIndex)
          .map(
            (copy): CustomerServiceRecordFileAttachmentProps => ({
              fileId: copy.file.id,
              originalName: copy.file.originalName,
              mimeType: copy.file.mimeType,
              size: copy.file.size,
              addedAt: new Date(),
              addedBy: input.actorUserId,
            }),
          );
        const asset = normalizeAssets([item.input.asset])[0];
        const record = new CustomerServiceRecord({
          sourceServicePackageRecordId: source.id,
          sourceServiceOrder: source.serviceOrder,
          serviceNumber,
          ...item.serviceType,
          requestedAt: item.requestedAt,
          observations: null,
          customer: item.customer,
          assets: [
            { ...asset, intakeConditionFiles: { files, removedFiles: [] } },
          ],
          attachmentsCount: files.length,
          customerVisibleAttachmentsCount: files.length,
          customerDelivery: {
            receivedAt: item.receivedAt,
            estimatedDeliveryInterval: {
              years: 0,
              months: 0,
              weeks: 0,
              days: 0,
            },
            estimatedDeliveryAt: null,
            deliveredToCustomerAt: null,
            statusPolicyId: null,
            notificationPolicyId: null,
            statusMaterialization: null,
            notificationMaterialization: null,
          },
          provider: null,
          operationalStatus: CustomerServiceRecordOperationalStatus.PENDING,
          createdBy: input.actorUserId,
          updatedBy: input.actorUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const { data } = await this.targetWrite.create(record);
        if (!data) throw new Error('Target record was not created');
        await this.materializationsRefresher.refresh({
          records: [data],
          customerDeliveryStatus: true,
          customerDeliveryNotification: true,
          providerStatus: true,
          providerNotification: true,
          providerFollowUp: true,
        });
        result.records.push({
          equipmentIndex: item.input.equipmentIndex,
          customerServiceRecordId: data.id,
          serviceNumber: data.serviceNumber,
          serviceNumberDisplay: data.serviceNumberDisplay,
        });
      }
      return result;
    });
  }

  private async prepare(
    input: ConvertServicePackageRecordDto,
    source: ServicePackageRecord,
  ): Promise<PreparedItem[]> {
    const equipment = source.details.equipment;
    if (
      !Array.isArray(equipment) ||
      equipment.length === 0 ||
      input.records.length !== equipment.length
    ) {
      throw this.invalid('records', 'EQUIPMENT_COVERAGE');
    }
    const seen = new Set<number>();
    const filesById = new Map(
      source.files.map((file) => [file.id ?? file.s3Key, file]),
    );
    const prepared: PreparedItem[] = [];
    for (const item of input.records) {
      if (
        !Number.isInteger(item.equipmentIndex) ||
        item.equipmentIndex < 0 ||
        item.equipmentIndex >= equipment.length ||
        seen.has(item.equipmentIndex)
      ) {
        throw this.invalid('equipment_index', 'EQUIPMENT_COVERAGE');
      }
      seen.add(item.equipmentIndex);
      const photoIds = new Set(item.photoFileIds);
      if (photoIds.size !== item.photoFileIds.length)
        throw this.invalid('photo_file_ids', 'DUPLICATE_PHOTO');
      const photos = item.photoFileIds.map((id) => filesById.get(id));
      if (
        photos.some((file) => !file || !file.contentType.startsWith('image/'))
      ) {
        throw this.invalid('photo_file_ids', 'INVALID_SOURCE_PHOTO');
      }
      const receivedAt = this.requiredDate(
        item.receivedAt ?? source.visitDate,
        'received_at',
      );
      const requestedAt = this.requiredDate(item.requestedAt, 'requested_at');
      normalizeAssets([item.asset]);
      const [serviceType, customer] = await Promise.all([
        this.inputPreparation.prepareServiceType(item.serviceTypeCode),
        this.inputPreparation.prepareCustomer(item.customer),
      ]);
      prepared.push({
        input: item,
        serviceType,
        customer,
        requestedAt,
        receivedAt,
        photos: photos as ServicePackageRecordFileProps[],
      });
    }
    return prepared;
  }

  private invalid(field: string, reason: string): InvalidValueException {
    return InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field,
      reason,
    });
  }

  private requiredDate(
    value: string | null | undefined,
    field: string,
  ): string {
    const date = this.inputPreparation.normalizeDate(value, field);
    if (!date) throw this.invalid(field, 'REQUIRED');
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    ) {
      throw this.invalid(field, 'INVALID_DATE_ONLY');
    }
    return date;
  }
}
