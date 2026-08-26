import { Inject, Injectable } from '@nestjs/common';

import {
  IContactWriteRepository,
  IContactWriteRepositoryToken,
} from '@domain/ports/repositories';
import { UserCompanyNamesResolution } from './user-customer-company-names-resolver.service';

@Injectable()
export class UserContactCompanyNamesSynchronizer {
  constructor(
    @Inject(IContactWriteRepositoryToken)
    private readonly contactWriteRepository: IContactWriteRepository,
  ) {}

  async synchronize(resolutions: UserCompanyNamesResolution[]): Promise<void> {
    if (resolutions.length === 0) {
      return;
    }

    await this.contactWriteRepository.replaceCompanyNamesForUsers(resolutions);
  }
}
