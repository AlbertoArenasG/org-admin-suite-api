import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordCustomerDto,
  UpdateCustomerServiceRecordCustomerResultDto,
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

@Injectable()
export class UpdateCustomerServiceRecordCustomerUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly inputPreparation: CustomerServiceRecordInputPreparationService,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordCustomerDto,
  ): Promise<UpdateCustomerServiceRecordCustomerResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );

    const [customer, customerDelivery] = await Promise.all([
      this.inputPreparation.prepareCustomer(input.customer),
      this.inputPreparation.prepareCustomerDelivery(
        input.customerDelivery,
        record.customerDelivery,
      ),
    ]);
    record.updateDetails({ customer, customerDelivery }, input.actorUserId);

    const { data } = await this.writeRepository.update(record);
    await this.materializationsRefresher.refresh({
      records: [data!],
      customerDeliveryStatus: true,
      customerDeliveryNotification: true,
      providerStatus: false,
      providerNotification: false,
      providerFollowUp: false,
    });
    const { data: refreshed } = await this.readRepository.findById(data!.id);
    return CustomerServiceRecordMapper.toViewDto(refreshed!);
  }
}
