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
      role: document.role,
      tenantId: document.tenant_id ?? null,
      invitedByUserId: document.invited_by_user_id,
      existingUserId: document.existing_user_id ?? null,
      tokenHash: document.token_hash,
      userData,
      consumedAt: document.consumed_at ?? null,
      respondedAt: document.responded_at ?? null,
      responseDecision: document.response_decision ?? null,
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
      tenant_id: record.tenantId ?? null,
      invited_by_user_id: record.invitedByUserId,
      existing_user_id: record.existingUserId ?? null,
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
      responded_at: null,
      response_decision: null,
    };
  }
}
