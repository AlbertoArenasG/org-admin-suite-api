import { UserRegistrationInvitationDto } from '@application/dto';
import { UserRegistrationInvitationRecord } from '@domain/ports/repositories';

export class UserRegistrationInvitationMapper {
  static toDto(
    record: UserRegistrationInvitationRecord | null,
  ): UserRegistrationInvitationDto | null {
    if (!record) return null;

    return {
      invitationId: record.invitationId,
      email: record.email,
      scope: record.scope,
      type: record.type,
      status: record.status,
      role: record.role,
      tenantId: record.tenantId ?? null,
      invitedByUserId: record.invitedByUserId,
      existingUserId: record.existingUserId ?? null,
      userData: record.userData ?? null,
      consumedAt: record.consumedAt ?? null,
      respondedAt: record.respondedAt ?? null,
      responseDecision: record.responseDecision ?? null,
      createdAt: record.createdAt ?? null,
      updatedAt: record.updatedAt ?? null,
    };
  }
}
