import { Inject, Injectable } from '@nestjs/common';
import { DeleteCustomerServiceRecordDto } from '@application/dto';
import { CustomerServiceRecordTechnicalMaterializationsRefresherService } from '@application/services';
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
export class DeleteCustomerServiceRecordUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writeRepository: ICustomerServiceRecordWriteRepository,
    private readonly materializationsRefresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}
  async execute(input: DeleteCustomerServiceRecordDto): Promise<void> {
    const { data: record } = await this.readRepository.findById(input.recordId);
    if (!record)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId: input.recordId },
      );
    record.markAsDeleted(input.actorUserId);
    await this.writeRepository.update(record);
    await this.materializationsRefresher.refresh({
      records: [record],
      customerDeliveryStatus: true,
      customerDeliveryNotification: true,
      providerStatus: true,
      providerNotification: true,
      providerFollowUp: true,
    });
  }
}
