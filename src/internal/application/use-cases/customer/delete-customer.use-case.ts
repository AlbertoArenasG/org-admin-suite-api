import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  ICustomerWriteRepository,
  ICustomerWriteRepositoryToken,
} from '@domain/ports/repositories';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { CustomerStatus } from '@domain/entities';
import { CustomerContactCompanyNamesSynchronizerService } from '@application/services/user-customer-relationship';
import {
  ITransactionalExecutor,
  ITransactionalExecutorToken,
} from '@domain/ports/services';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(ICustomerWriteRepositoryToken)
    private readonly customerWriteRepository: ICustomerWriteRepository,
    @Inject(ITransactionalExecutorToken)
    private readonly transactionalExecutor: ITransactionalExecutor,
    private readonly customerContactSynchronizer: CustomerContactCompanyNamesSynchronizerService,
  ) {}

  async execute(customerId: string): Promise<void> {
    const { data: customer } =
      await this.customerReadRepository.findById(customerId);

    if (!customer || customer.status === CustomerStatus.DELETED) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { id: customerId },
      );
    }

    customer.markAsDeleted();
    await this.transactionalExecutor.execute(async () => {
      await this.customerWriteRepository.update(customer);
      await this.customerContactSynchronizer.synchronizeByCustomerId(
        customer.id,
      );
    });
  }
}
