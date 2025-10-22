import { Injectable } from '@nestjs/common';

import { UserRegistrationInvitationDto } from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';
import { UserRegistrationInvitationScope } from '@domain/ports/repositories';

@Injectable()
export class UserRegistrationInvitationPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toTenantResponse(invitation: UserRegistrationInvitationDto) {
    return {
      invitation_id: invitation.invitationId,
      scope: invitation.scope,
      type: invitation.type,
      status: invitation.status,
      email: invitation.email,
      role: invitation.role,
      role_name: this.enumNameService.getEnumName(
        `TENANT.USER.ROLE.${invitation.role}`,
      ),
      tenant_id: invitation.tenantId ?? null,
      invited_by_user_id: invitation.invitedByUserId,
      existing_user_id: invitation.existingUserId ?? null,
      user_data: this.mapUserData(invitation.userData),
      consumed_at: invitation.consumedAt ?? null,
      responded_at: invitation.respondedAt ?? null,
      response_decision: invitation.responseDecision ?? null,
      created_at: invitation.createdAt ?? null,
      updated_at: invitation.updatedAt ?? null,
    };
  }

  toMasterResponse(invitation: UserRegistrationInvitationDto) {
    return {
      invitation_id: invitation.invitationId,
      scope: invitation.scope,
      type: invitation.type,
      status: invitation.status,
      email: invitation.email,
      role: invitation.role,
      role_name: this.enumNameService.getEnumName(
        `USER.ROLE.${invitation.role}`,
      ),
      invited_by_user_id: invitation.invitedByUserId,
      existing_user_id: invitation.existingUserId ?? null,
      user_data: this.mapUserData(invitation.userData),
      consumed_at: invitation.consumedAt ?? null,
      responded_at: invitation.respondedAt ?? null,
      response_decision: invitation.responseDecision ?? null,
      created_at: invitation.createdAt ?? null,
      updated_at: invitation.updatedAt ?? null,
    };
  }

  toPublicResponse(invitation: UserRegistrationInvitationDto) {
    return {
      scope: invitation.scope,
      type: invitation.type,
      status: invitation.status,
      email: invitation.email,
      role: invitation.role,
      tenant_id:
        invitation.scope === UserRegistrationInvitationScope.TENANT
          ? (invitation.tenantId ?? null)
          : null,
      existing_user_id: invitation.existingUserId ?? null,
      response_decision: invitation.responseDecision ?? null,
      responded_at: invitation.respondedAt ?? null,
      user_data: this.mapUserData(invitation.userData),
      created_at: invitation.createdAt ?? null,
    };
  }

  private mapUserData(userData?: Record<string, unknown> | null) {
    if (!userData) {
      return null;
    }

    const { cellPhone, name, lastname, ...additional } = userData as {
      cellPhone?: { countryCode: string | null; number: string | null } | null;
      name?: string | null;
      lastname?: string | null;
    } & Record<string, unknown>;

    const cellPhonePayload = cellPhone
      ? {
          country_code: cellPhone.countryCode ?? null,
          number: cellPhone.number ?? null,
        }
      : null;

    return {
      name: name ?? null,
      lastname: lastname ?? null,
      cell_phone: cellPhonePayload,
      ...additional,
    };
  }
}
