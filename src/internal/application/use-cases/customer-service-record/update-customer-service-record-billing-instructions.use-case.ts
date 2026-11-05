import { Inject, Injectable } from '@nestjs/common';

import {
  UpdateCustomerServiceRecordBillingInstructionsDto,
  UpdateCustomerServiceRecordBillingInstructionsResultDto,
} from '@application/dto';
import { CustomerServiceRecordMapper } from '@application/mappers';
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
export class UpdateCustomerServiceRecordBillingInstructionsUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
  ) {}

  async execute(
    input: UpdateCustomerServiceRecordBillingInstructionsDto,
  ): Promise<UpdateCustomerServiceRecordBillingInstructionsResultDto> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    }
    record.updateBillingInstructions(
      input.billingInstructions,
      input.actorUserId,
    );
    const { data } =
      await this.writeRepository.updateBillingInstructions(record);
    if (!data) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    }
    return CustomerServiceRecordMapper.toViewDto(data);
  }
}
