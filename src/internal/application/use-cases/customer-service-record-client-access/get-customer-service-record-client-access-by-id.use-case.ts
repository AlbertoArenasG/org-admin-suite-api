import { Injectable } from '@nestjs/common';

import { CustomerServiceRecordClientAccessViewDto } from '@application/dto';
import { CustomerServiceRecordClientAccessMapper } from '@application/mappers';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { CustomerServiceRecordClientAccessUseCase } from './customer-service-record-client-access.shared';
@Injectable()
export class GetCustomerServiceRecordClientAccessByIdUseCase extends CustomerServiceRecordClientAccessUseCase {
  async execute(
    actorUserId: string,
    recordId: string,
  ): Promise<CustomerServiceRecordClientAccessViewDto> {
    const visibility = await this.visibility.resolve(actorUserId);
    const { data } = await this.repository.findById(
      recordId,
      actorUserId,
      visibility.customerIds,
      visibility.isInternalStaff,
    );
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId },
      );
    return CustomerServiceRecordClientAccessMapper.toViewDto(data);
  }
}
