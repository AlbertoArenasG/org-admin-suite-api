import { Inject, Injectable } from '@nestjs/common';
import {
  UpdateCustomerServiceRecordDto,
  UpdateCustomerServiceRecordResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import {
  CustomerServiceRecordInputPreparationService,
  CustomerServiceRecordTechnicalMaterializationsRefresherService,
} from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  assertOperationalStatus,
  normalizeAssets,
} from './customer-service-record.shared';
@Injectable()
export class UpdateCustomerServiceRecordUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly inputPreparation: CustomerServiceRecordInputPreparationService,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}
  async execute(
    input: UpdateCustomerServiceRecordDto,
  ): Promise<UpdateCustomerServiceRecordResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    const hasChanges = [
      input.serviceTypeCode,
      input.requestedAt,
      input.observations,
      input.customer,
      input.assets,
      input.customerDelivery,
      input.provider,
      input.operationalStatus,
    ].some((value) => value !== undefined);
    if (!hasChanges) return CustomerServiceRecordMapper.toViewDto(record);
    const serviceType =
      input.serviceTypeCode === undefined
        ? null
        : await this.inputPreparation.prepareServiceType(input.serviceTypeCode);
    const customer =
      input.customer === undefined
        ? undefined
        : await this.inputPreparation.prepareCustomer(input.customer);
    const customerDelivery =
      input.customerDelivery === undefined
        ? undefined
        : await this.inputPreparation.prepareCustomerDelivery(
            { ...record.customerDelivery, ...input.customerDelivery },
            record.customerDelivery,
          );
    const provider =
      input.provider === undefined
        ? undefined
        : await this.inputPreparation.prepareProvider(
            input.provider,
            record.provider,
          );
    record.updateDetails(
      {
        ...(serviceType ?? {}),
        ...(input.requestedAt === undefined
          ? {}
          : {
              requestedAt: this.inputPreparation.normalizeDate(
                input.requestedAt,
                'requested_at',
              )!,
            }),
        ...(input.observations === undefined
          ? {}
          : { observations: input.observations?.trim() || null }),
        ...(customer === undefined ? {} : { customer }),
        ...(input.assets === undefined
          ? {}
          : { assets: normalizeAssets(input.assets) }),
        ...(customerDelivery === undefined ? {} : { customerDelivery }),
        ...(provider === undefined ? {} : { provider }),
        ...(input.operationalStatus === undefined
          ? {}
          : {
              operationalStatus: assertOperationalStatus(
                input.operationalStatus,
              ),
            }),
      },
      input.actorUserId,
    );
    const { data } = await this.writeRepository.update(record);
    const refreshAll = input.operationalStatus !== undefined;
    await this.materializationsRefresher.refresh({
      records: [data!],
      customerDeliveryStatus: refreshAll || customerDelivery !== undefined,
      customerDeliveryNotification:
        refreshAll || customerDelivery !== undefined,
      providerStatus: refreshAll || provider !== undefined,
      providerNotification: refreshAll || provider !== undefined,
      providerFollowUp: refreshAll || provider !== undefined,
    });
    const { data: refreshed } = await this.readRepository.findById(data!.id);
    return CustomerServiceRecordMapper.toViewDto(refreshed!);
  }
}
