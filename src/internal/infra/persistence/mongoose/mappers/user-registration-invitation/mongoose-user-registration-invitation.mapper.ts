import {
  CreateUserRegistrationInvitationRecord,
  UserRegistrationInvitationRecord,
  UserRegistrationInvitationUserData,
} from '@domain/ports/repositories';
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
      systemRole: document.system_role,
      roleId: document.role_id ?? null,
      invitedByUserId: document.invited_by_user_id,
      tokenHash: document.token_hash,
      userData,
      customerIds: document.customer_ids ?? [],
      consumedAt: document.consumed_at ?? null,
      emailDelivery: {
        lastAttemptAt: document.email_delivery?.last_attempt_at ?? null,
        lastAttemptStatus: document.email_delivery?.last_attempt_status ?? null,
      },
      resendCount: document.resend_count ?? 0,
      revokedAt: document.revoked_at ?? null,
      revokedByUserId: document.revoked_by_user_id ?? null,
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
      customer_ids: record.customerIds,
      consumed_at: null,
      email_delivery: {
        last_attempt_at: record.emailDelivery.lastAttemptAt,
        last_attempt_status: record.emailDelivery.lastAttemptStatus,
      },
      resend_count: record.resendCount,
      revoked_at: record.revokedAt,
      revoked_by_user_id: record.revokedByUserId,
    };
  }
}
