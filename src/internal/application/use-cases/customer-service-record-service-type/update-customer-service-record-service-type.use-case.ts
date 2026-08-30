import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordServiceTypeDto,
  UpdateCustomerServiceRecordServiceTypeResultDto,
} from '@application/dto';
import { CustomerServiceRecordServiceTypeMapper } from '@application/mappers';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordServiceTypeReadRepository,
  ICustomerServiceRecordServiceTypeReadRepositoryToken,
  ICustomerServiceRecordServiceTypeWriteRepository,
  ICustomerServiceRecordServiceTypeWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UpdateCustomerServiceRecordServiceTypeUseCase {
  constructor(
    @Inject(ICustomerServiceRecordServiceTypeReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordServiceTypeReadRepository,
    @Inject(ICustomerServiceRecordServiceTypeWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordServiceTypeWriteRepository,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordServiceTypeDto,
  ): Promise<UpdateCustomerServiceRecordServiceTypeResultDto> {
    const { data: serviceType } = await this.readRepository.findById(
      input.serviceTypeId,
    );
    if (!serviceType) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD_SERVICE_TYPE,
        { serviceTypeId: input.serviceTypeId },
      );
    }

    serviceType.updateStatus(input.status, input.actorUserId);
    const { data } = await this.writeRepository.update(serviceType);
    return CustomerServiceRecordServiceTypeMapper.toDto(data!);
  }
}
