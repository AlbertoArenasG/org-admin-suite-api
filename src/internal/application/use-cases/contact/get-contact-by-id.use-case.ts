import { Inject, Injectable } from '@nestjs/common';

import { ContactViewDto } from '@application/dto';
import { ContactMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetContactByIdUseCase {
  constructor(
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(contactId: string): Promise<ContactViewDto> {
    const { data: contact } =
      await this.contactReadRepository.findById(contactId);

    if (!contact) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CONTACT,
        {
          contactId,
        },
      );
    }

    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: contact.createdBy,
        updatedBy: contact.updatedBy,
      });

    return ContactMapper.toViewDto(contact, createdByUser, updatedByUser);
  }
}
