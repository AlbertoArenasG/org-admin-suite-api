import { Inject, Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  IBillingRecordArchiveRepository,
  IBillingRecordArchiveRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetBillingCustomerServiceRecordArchivesUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly records: IBillingCustomerServiceRecordReadRepository,
    @Inject(IBillingRecordArchiveRepositoryToken)
    private readonly archives: IBillingRecordArchiveRepository,
  ) {}
  async execute(recordId: string, page: number, perPage: number) {
    const { data } = await this.records.findById(recordId);
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId },
      );
    return this.archives.findAll(recordId, page, perPage);
  }
}
