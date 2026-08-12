import {
  CreateRecipientGroupDto,
  UpdateRecipientGroupDto,
} from '@application/dto';
import { CreateRecipientGroupRequestDto } from './create-recipient-group.request.dto';

export class UpdateRecipientGroupRequestDto extends CreateRecipientGroupRequestDto {
  toDomain(actorUserId: string): CreateRecipientGroupDto;
  toDomain(
    recipientGroupId: string,
    actorUserId: string,
  ): UpdateRecipientGroupDto;
  toDomain(
    recipientGroupIdOrActorUserId: string,
    actorUserId?: string,
  ): CreateRecipientGroupDto | UpdateRecipientGroupDto {
    if (!actorUserId) {
      return super.toDomain(recipientGroupIdOrActorUserId);
    }

    const base = super.toDomain(actorUserId);

    return {
      recipientGroupId: recipientGroupIdOrActorUserId,
      ...base,
    };
  }
}
