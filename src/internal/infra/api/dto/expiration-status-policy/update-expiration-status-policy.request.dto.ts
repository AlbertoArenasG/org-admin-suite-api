import {
  CreateExpirationStatusPolicyDto,
  UpdateExpirationStatusPolicyDto,
} from '@application/dto';
import { CreateExpirationStatusPolicyRequestDto } from './create-expiration-status-policy.request.dto';

export class UpdateExpirationStatusPolicyRequestDto extends CreateExpirationStatusPolicyRequestDto {
  toDomain(actorUserId: string): CreateExpirationStatusPolicyDto;
  toDomain(
    expirationStatusPolicyId: string,
    actorUserId: string,
  ): UpdateExpirationStatusPolicyDto;
  toDomain(
    expirationStatusPolicyIdOrActorUserId: string,
    actorUserId?: string,
  ): CreateExpirationStatusPolicyDto | UpdateExpirationStatusPolicyDto {
    if (!actorUserId) {
      return super.toDomain(expirationStatusPolicyIdOrActorUserId);
    }

    const base = super.toDomain(actorUserId);

    return {
      expirationStatusPolicyId: expirationStatusPolicyIdOrActorUserId,
      ...base,
    };
  }
}
