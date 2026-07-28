import {
  CreateUserRegistrationInvitationRecord,
  UserRegistrationInvitationScope,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';
import { SystemRole, User } from '@domain/entities';
import { UserRegistrationInvitationDocument } from '@infra/persistence/mongoose/schemas';

export class MongooseUserRegistrationInvitationMapper {
  static toDomain(
    document: UserRegistrationInvitationDocument | null,
  ): UserRegistrationInvitationRecord | null {
    if (!document) return null;

    const baseUserData = document.user_data || {};
    const additional =
      typeof baseUserData.additional === 'object' && baseUserData.additional
        ? (baseUserData.additional as Record<string, unknown>)
        : {};

    const userData: UserRegistrationInvitationUserData = {
      name: baseUserData.name ?? null,
      lastname: baseUserData.lastname ?? null,
      cellPhone: baseUserData.cell_phone
        ? {
            countryCode: baseUserData.cell_phone.country_code ?? null,
            number: baseUserData.cell_phone.number ?? null,
          }
        : null,
      ...additional,
    };

    return {
      id: document._id?.toString() ?? document.id,
      invitationId: document.invitation_id,
      scope: document.scope,
      type: document.type,
      status: document.status,
      email: document.email,
      role: document.role,
      systemRole:
        document.system_role ??
        User.resolveSystemRoleFromLegacyRole(document.role as never),
      roleId:
        document.role_id ??
        resolveLegacyInvitationRoleId(
          document.scope,
          document.system_role ??
            User.resolveSystemRoleFromLegacyRole(document.role as never),
          document.role,
        ),
      invitedByUserId: document.invited_by_user_id,
      tokenHash: document.token_hash,
      userData,
      consumedAt: document.consumed_at ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  static toMongoose(record: CreateUserRegistrationInvitationRecord) {
    const additionalData = { ...(record.userData ?? {}) };
    const cellPhone = additionalData.cellPhone || null;

    delete (additionalData as Record<string, unknown>).cellPhone;
    delete (additionalData as Record<string, unknown>).name;
    delete (additionalData as Record<string, unknown>).lastname;

    return {
      scope: record.scope,
      type: record.type,
      status: record.status,
      email: record.email,
      role: record.role,
      system_role: record.systemRole,
      role_id: record.roleId,
      invited_by_user_id: record.invitedByUserId,
      token_hash: record.tokenHash,
      user_data: {
        name: record.userData?.name ?? null,
        lastname: record.userData?.lastname ?? null,
        cell_phone: cellPhone
          ? {
              country_code: cellPhone.countryCode ?? null,
              number: cellPhone.number ?? null,
            }
          : null,
        additional: additionalData,
      },
      consumed_at: null,
    };
  }
}

function resolveLegacyInvitationRoleId(
  scope: UserRegistrationInvitationScope,
  systemRole: SystemRole,
  legacyRole: string,
): string | null {
  if (systemRole === SystemRole.MASTER_ADMIN) {
    return 'MASTER_ADMIN_DEFAULT';
  }

  if (systemRole === SystemRole.ADMIN) {
    return 'ADMIN_DEFAULT';
  }

  if (scope === UserRegistrationInvitationScope.APPLICATION || legacyRole) {
    return 'STAFF_LEGACY';
  }

  return null;
}
