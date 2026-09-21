import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordProviderDto,
  UpdateCustomerServiceRecordProviderResultDto,
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
export class UpdateCustomerServiceRecordProviderUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly inputPreparation: CustomerServiceRecordInputPreparationService,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordProviderDto,
  ): Promise<UpdateCustomerServiceRecordProviderResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );

    const provider = await this.inputPreparation.prepareProvider(
      input.provider,
      record.provider,
    );
    record.updateDetails({ provider }, input.actorUserId);

    const { data } = await this.writeRepository.update(record);
    await this.materializationsRefresher.refresh({
      records: [data!],
      customerDeliveryStatus: false,
      customerDeliveryNotification: false,
      providerStatus: true,
      providerNotification: true,
      providerFollowUp: true,
    });
    const { data: refreshed } = await this.readRepository.findById(data!.id);
    return CustomerServiceRecordMapper.toViewDto(refreshed!);
  }
}
