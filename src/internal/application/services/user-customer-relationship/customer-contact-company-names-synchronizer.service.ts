import { Inject, Injectable } from '@nestjs/common';

import {
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';
import { SyncUserContactService } from '../contact';

@Injectable()
export class CustomerContactCompanyNamesSynchronizerService {
  constructor(
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    private readonly syncUserContactService: SyncUserContactService,
  ) {}

  async synchronizeByCustomerId(customerId: string): Promise<void> {
    const { data: relationships } =
      await this.relationshipReadRepository.findByCustomerId(customerId);
    const userIds = [
      ...new Set(relationships.map((relationship) => relationship.userId)),
    ];
    await this.syncUserContactService.syncCompanyNamesForUsers(userIds);
  }
}
