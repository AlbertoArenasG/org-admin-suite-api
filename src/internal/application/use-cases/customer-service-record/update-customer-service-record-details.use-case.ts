import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordDetailsDto,
  UpdateCustomerServiceRecordDetailsResultDto,
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
import { assertOperationalStatus } from './customer-service-record.shared';

@Injectable()
export class UpdateCustomerServiceRecordDetailsUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly inputPreparation: CustomerServiceRecordInputPreparationService,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordDetailsDto,
  ): Promise<UpdateCustomerServiceRecordDetailsResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );

    const serviceType = await this.inputPreparation.prepareServiceType(
      input.serviceTypeCode,
    );
    record.updateDetails(
      {
        ...serviceType,
        requestedAt: this.inputPreparation.normalizeDate(
          input.requestedAt,
          'requested_at',
        )!,
        observations: input.observations?.trim() || null,
        operationalStatus: assertOperationalStatus(input.operationalStatus),
      },
      input.actorUserId,
    );

    const { data } = await this.writeRepository.update(record);
    await this.materializationsRefresher.refresh({
      records: [data!],
      customerDeliveryStatus: true,
      customerDeliveryNotification: true,
      providerStatus: true,
      providerNotification: true,
      providerFollowUp: true,
    });
    const { data: refreshed } = await this.readRepository.findById(data!.id);
    return CustomerServiceRecordMapper.toViewDto(refreshed!);
  }
}
