import { Inject, Injectable } from '@nestjs/common';

import {
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';
import { UserCustomerCompanyNamesResolverService } from './user-customer-company-names-resolver.service';
import { UserContactCompanyNamesSynchronizerService } from './user-contact-company-names-synchronizer.service';

@Injectable()
export class CustomerContactCompanyNamesSynchronizerService {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    private readonly companyNamesResolver: UserCustomerCompanyNamesResolverService,
    private readonly userContactSynchronizer: UserContactCompanyNamesSynchronizerService,
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
