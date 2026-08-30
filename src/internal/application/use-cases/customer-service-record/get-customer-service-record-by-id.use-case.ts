import { Inject, Injectable } from '@nestjs/common';
import { GetCustomerServiceRecordByIdResultDto } from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
} from '@domain/ports/repositories';
@Injectable()
export class GetCustomerServiceRecordByIdUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
  ) {}
  async execute(
    recordId: string,
  ): Promise<GetCustomerServiceRecordByIdResultDto> {
    const { data } = await this.readRepository.findById(recordId);
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId },
      );
    return CustomerServiceRecordMapper.toViewDto(data);
  }
}
