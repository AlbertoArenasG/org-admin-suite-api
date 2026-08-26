import { Inject, Injectable } from '@nestjs/common';

import {
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';
import { UserCustomerCompanyNamesResolver } from './user-customer-company-names-resolver.service';
import { UserContactCompanyNamesSynchronizer } from './user-contact-company-names-synchronizer.service';

@Injectable()
export class CustomerContactCompanyNamesSynchronizer {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    private readonly companyNamesResolver: UserCustomerCompanyNamesResolver,
    private readonly userContactSynchronizer: UserContactCompanyNamesSynchronizer,
  ) {}

  async synchronizeByCustomerId(customerId: string): Promise<void> {
    const { data: relationships } =
      await this.relationshipReadRepository.findByCustomerId(customerId);
    const userIds = [
      ...new Set(relationships.map((relationship) => relationship.userId)),
    ];
    const resolutions =
      await this.companyNamesResolver.resolveForUserIds(userIds);

    await this.userContactSynchronizer.synchronize(resolutions);
  }
}
