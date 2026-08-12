import { Inject, Injectable } from '@nestjs/common';

import { DeleteContactDto } from '@application/dto';
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
export class DeleteContactUseCase {
  constructor(
    @Inject(IContactReadRepositoryToken)
    private readonly contactReadRepository: IContactReadRepository,
    @Inject(IContactWriteRepositoryToken)
    private readonly contactWriteRepository: IContactWriteRepository,
  ) {}

  async execute(input: DeleteContactDto): Promise<void> {
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

    contact.markAsDeleted(input.actorUserId);
    await this.contactWriteRepository.update(contact);
  }
}
