import {
  ApplicationUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
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
      systemRole: record.systemRole,
      roleId: record.roleId,
      invitedByUserId: record.invitedByUserId,
      userData: record.userData ?? null,
      consumedAt: record.consumedAt ?? null,
      createdAt: record.createdAt ?? null,
      updatedAt: record.updatedAt ?? null,
    };
  }

  static toApplicationDto(
    record: UserRegistrationInvitationRecord | null,
    roleName: string | null = null,
  ): ApplicationUserRegistrationInvitationDto | null {
    if (!record) return null;

    return {
      invitationId: record.invitationId,
      email: record.email,
      status: record.status,
      systemRole: record.systemRole,
      roleId: record.roleId,
      roleName,
      userData: record.userData ?? null,
      invitedByUserId: record.invitedByUserId,
      createdAt: record.createdAt ?? null,
      consumedAt: record.consumedAt ?? null,
      revokedAt: record.revokedAt,
      revokedByUserId: record.revokedByUserId,
      emailDelivery: record.emailDelivery,
      resendCount: record.resendCount,
    };
  }
}
