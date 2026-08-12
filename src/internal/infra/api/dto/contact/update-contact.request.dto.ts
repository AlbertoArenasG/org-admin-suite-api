import { CreateContactDto, UpdateContactDto } from '@application/dto';
import { CreateContactRequestDto } from './create-contact.request.dto';

export class UpdateContactRequestDto extends CreateContactRequestDto {
  toDomain(actorUserId: string): CreateContactDto;
  toDomain(contactId: string, actorUserId: string): UpdateContactDto;
  toDomain(
    contactIdOrActorUserId: string,
    actorUserId?: string,
  ): CreateContactDto | UpdateContactDto {
    if (!actorUserId) {
      return super.toDomain(contactIdOrActorUserId);
    }

    const base = super.toDomain(actorUserId) as CreateContactDto;

    return {
      contactId: contactIdOrActorUserId,
      ...base,
    };
  }
}
