import { Inject } from '@nestjs/common';

import {
  ICustomerServiceRecordClientAccessReadRepository,
  ICustomerServiceRecordClientAccessReadRepositoryToken,
} from '@domain/ports/repositories';
import { CustomerServiceRecordClientAccessVisibilityService } from '@application/services';

export abstract class CustomerServiceRecordClientAccessUseCase {
  constructor(
    protected readonly visibility: CustomerServiceRecordClientAccessVisibilityService,
    @Inject(ICustomerServiceRecordClientAccessReadRepositoryToken)
    protected readonly repository: ICustomerServiceRecordClientAccessReadRepository,
  ) {}
}
