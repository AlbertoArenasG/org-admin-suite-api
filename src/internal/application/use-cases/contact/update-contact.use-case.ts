import { Inject, Injectable } from '@nestjs/common';

import { UpdateContactDto, UpdateContactResultDto } from '@application/dto';
import { ContactMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
  IContactWriteRepository,
  IContactWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    @Inject(IContactWriteRepositoryToken)
    private readonly contactWriteRepository: IContactWriteRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(input: UpdateContactDto): Promise<UpdateContactResultDto> {
    const { data: contact } = await this.contactReadRepository.findById(
      input.contactId,
    );

    if (!contact) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CONTACT,
        {
          contactId: input.contactId,
        },
      );
    }

    if (contact.userId) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'contact_id',
        reason: 'CONTACT_LINKED_TO_USER',
      });
    }

    this.ensureHasAtLeastOneContactValue(input);

    contact.updateDetails(
      {
        name: input.name,
        lastname: input.lastname,
        companyName: input.companyName,
        emails: input.emails,
        phones: input.phones,
        cellPhones: input.cellPhones,
      },
      input.actorUserId,
    );

    const { data: updated } = await this.contactWriteRepository.update(contact);
    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: updated!.createdBy,
        updatedBy: updated!.updatedBy,
      });

    return ContactMapper.toViewDto(updated!, createdByUser, updatedByUser);
  }

  private ensureHasAtLeastOneContactValue(input: UpdateContactDto): void {
    const hasValues =
      input.emails.length > 0 ||
      input.phones.length > 0 ||
      input.cellPhones.length > 0;

    if (!hasValues) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'contact_values',
      });
    }
  }
}
