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
export class GetBillingCustomerServiceRecordArchiveByIdUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly records: IBillingCustomerServiceRecordReadRepository,
    @Inject(IBillingRecordArchiveRepositoryToken)
    private readonly archives: IBillingRecordArchiveRepository,
  ) {}
  async execute(recordId: string, archiveId: string) {
    const { data } = await this.records.findById(recordId);
    if (!data)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD,
        { recordId },
      );
    const archive = await this.archives.findById(recordId, archiveId);
    if (!archive)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.BILLING_RECORD_ARCHIVE,
        { recordId, archiveId },
      );
    return archive;
  }
}
