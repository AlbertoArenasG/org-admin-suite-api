import {
  CreateExpirationNotificationPolicyDto,
  UpdateExpirationNotificationPolicyDto,
} from '@application/dto';
import { CreateExpirationNotificationPolicyRequestDto } from './create-expiration-notification-policy.request.dto';

export class UpdateExpirationNotificationPolicyRequestDto extends CreateExpirationNotificationPolicyRequestDto {
  toDomain(actorUserId: string): CreateExpirationNotificationPolicyDto;
  toDomain(
    expirationNotificationPolicyId: string,
    actorUserId: string,
  ): UpdateExpirationNotificationPolicyDto;
  toDomain(
    expirationNotificationPolicyIdOrActorUserId: string,
    actorUserId?: string,
  ):
    | CreateExpirationNotificationPolicyDto
    | UpdateExpirationNotificationPolicyDto {
    if (!actorUserId) {
      return super.toDomain(expirationNotificationPolicyIdOrActorUserId);
    }

    const base = super.toDomain(actorUserId);

    return {
      expirationNotificationPolicyId:
        expirationNotificationPolicyIdOrActorUserId,
      ...base,
    };
  }
}
