import { Inject, Injectable } from '@nestjs/common';

import { CreateContactDto, CreateContactResultDto } from '@application/dto';
import { ContactMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import { Contact } from '@domain/entities';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IContactWriteRepository,
  IContactWriteRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(IContactWriteRepositoryToken)
    private readonly contactWriteRepository: IContactWriteRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(input: CreateContactDto): Promise<CreateContactResultDto> {
    this.ensureHasAtLeastOneContactValue(input);

    const contact = new Contact({
      userId: null,
      isInternalStaff: input.isInternalStaff,
      name: input.name,
      lastname: input.lastname,
      companyNames: input.companyNames,
      emails: input.emails,
      phones: input.phones,
      cellPhones: input.cellPhones,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { data } = await this.contactWriteRepository.create(contact);
    const createdByUser = await this.auditUserFetcher.fetchAuditUser(
      input.actorUserId,
    );

    return ContactMapper.toViewDto(data!, createdByUser, createdByUser);
  }

  private ensureHasAtLeastOneContactValue(input: CreateContactDto): void {
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
