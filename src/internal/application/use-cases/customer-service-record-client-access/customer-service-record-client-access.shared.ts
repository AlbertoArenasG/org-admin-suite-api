import { Inject } from '@nestjs/common';

import {
  ICustomerServiceRecordClientAccessReadRepository,
  ICustomerServiceRecordClientAccessReadRepositoryToken,
} from '@domain/ports/repositories';
import { CustomerServiceRecordClientAccessVisibilityService } from '@application/services';

export abstract class CustomerServiceRecordClientAccessUseCase {
  constructor(
    @Inject(CustomerServiceRecordClientAccessVisibilityService)
    protected readonly visibility: CustomerServiceRecordClientAccessVisibilityService,
    @Inject(ICustomerServiceRecordClientAccessReadRepositoryToken)
    protected readonly repository: ICustomerServiceRecordClientAccessReadRepository,
  ) {}
}
