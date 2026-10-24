import { Inject, Injectable } from '@nestjs/common';
import { GetBillingCustomerServiceRecordByIdResultDto } from '@application/dto/customer-service-record-billing';
import { BillingCustomerServiceRecordMapper } from '@application/mappers/customer-service-record-billing';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
} from '@domain/ports/repositories/customer-service-record-billing';

@Injectable()
export class GetBillingCustomerServiceRecordByIdUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: IBillingCustomerServiceRecordReadRepository,
  ) {}

  async execute(
    recordId: string,
  ): Promise<GetBillingCustomerServiceRecordByIdResultDto> {
    const { data } = await this.readRepository.findById(recordId);
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId },
      );
    return BillingCustomerServiceRecordMapper.toViewDto(data);
  }
}
