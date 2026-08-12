import { Inject, Injectable } from '@nestjs/common';

import { GetRecipientGroupByIdResultDto } from '@application/dto';
import { RecipientGroupMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import { Contact, ContactStatus } from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import {
  IContactReadRepository,
  IContactReadRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetRecipientGroupByIdUseCase {
  constructor(
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(
    recipientGroupId: string,
  ): Promise<GetRecipientGroupByIdResultDto> {
    const { data: recipientGroup } =
      await this.recipientGroupReadRepository.findById(recipientGroupId);

    if (!recipientGroup) {
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.RECIPIENT_GROUP,
        { recipientGroupId },
      );
    }

    const { data: contacts } = await this.contactReadRepository.findByIds(
      recipientGroup.contactIds,
    );
    const contactsById = new Map(
      contacts.map((contact) => [contact.id, contact]),
    );
    const orderedContacts = recipientGroup.contactIds
      .map((contactId) => contactsById.get(contactId) ?? null)
      .filter((contact): contact is Contact => contact !== null)
      .filter((contact) => contact.status !== ContactStatus.DELETED);

    const { createdByUser, updatedByUser } =
      await this.auditUserFetcher.fetchAuditUsers({
        createdBy: recipientGroup.createdBy,
        updatedBy: recipientGroup.updatedBy,
      });

    return RecipientGroupMapper.toViewDto(
      recipientGroup,
      orderedContacts,
      createdByUser,
      updatedByUser,
    );
  }
}
