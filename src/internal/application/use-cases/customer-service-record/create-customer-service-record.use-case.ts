import { Inject, Injectable } from '@nestjs/common';
import {
  CreateCustomerServiceRecordDto,
  CreateCustomerServiceRecordResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import {
  CustomerServiceRecordInputPreparationService,
  CustomerServiceRecordTechnicalMaterializationsRefresherService,
} from '@application/services';
import { CustomerServiceRecord } from '@domain/entities';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
  ISequenceCounterRepository,
  ISequenceCounterRepositoryToken,
} from '@domain/ports/repositories';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services/transactional-executor';
import {
  assertOperationalStatus,
  normalizeAssets,
} from './customer-service-record.shared';

@Injectable()
export class CreateCustomerServiceRecordUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    @Inject(ISequenceCounterRepositoryToken)
    private readonly sequenceCounterRepository: ISequenceCounterRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transactionalExecutor: ITransactionalExecutor,
    private readonly inputPreparation: CustomerServiceRecordInputPreparationService,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}
  async execute(
    input: CreateCustomerServiceRecordDto,
  ): Promise<CreateCustomerServiceRecordResultDto> {
    const [serviceType, customer, customerDelivery, provider] =
      await Promise.all([
        this.inputPreparation.prepareServiceType(input.serviceTypeCode),
        this.inputPreparation.prepareCustomer(input.customer),
        this.inputPreparation.prepareCustomerDelivery(input.customerDelivery),
        this.inputPreparation.prepareProvider(input.provider),
      ]);
    const record = await this.transactionalExecutor.execute(async () => {
      const serviceNumber = await this.sequenceCounterRepository.nextValue(
        'customer_service_records',
      );
      const entity = new CustomerServiceRecord({
        serviceNumber,
        ...serviceType,
        requestedAt: this.inputPreparation.normalizeDate(
          input.requestedAt,
          'requested_at',
        )!,
        observations: input.observations?.trim() || null,
        customer,
        assets: normalizeAssets(input.assets),
        customerDelivery,
        provider,
        operationalStatus: assertOperationalStatus(input.operationalStatus),
        createdBy: input.actorUserId,
        updatedBy: input.actorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const { data } = await this.writeRepository.create(entity);
      const createdRecord = data!;
      await this.materializationsRefresher.refresh({
        records: [createdRecord],
        customerDeliveryStatus: true,
        customerDeliveryNotification: true,
        providerStatus: true,
        providerNotification: true,
        providerFollowUp: true,
      });
      return createdRecord;
    });
    const { data } = await this.readRepository.findById(record.id);
    return CustomerServiceRecordMapper.toViewDto(data!);
  }
}
