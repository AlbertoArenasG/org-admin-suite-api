import { Injectable } from '@nestjs/common';

import {
  ApplicationUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { EnumNameService } from '@infra/i18n/services';

@Injectable()
export class UserRegistrationInvitationPresenter {
  constructor(private readonly enumNameService: EnumNameService) {}

  toApplicationResponse(invitation: UserRegistrationInvitationDto) {
    return {
      invitation_id: invitation.invitationId,
      scope: invitation.scope,
      type: invitation.type,
      status: invitation.status,
      email: invitation.email,
      system_role: invitation.systemRole,
      role_id: invitation.roleId,
      is_internal_staff: invitation.isInternalStaff,
      invited_by_user_id: invitation.invitedByUserId,
      user_data: this.mapUserData(invitation.userData),
      consumed_at: invitation.consumedAt ?? null,
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
      system_role: invitation.systemRole,
      role_id: invitation.roleId,
      is_internal_staff: invitation.isInternalStaff,
      invited_by_user_id: invitation.invitedByUserId,
      user_data: this.mapUserData(invitation.userData),
      consumed_at: invitation.consumedAt ?? null,
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
      system_role: invitation.systemRole,
      role_id: invitation.roleId,
      user_data: this.mapUserData(invitation.userData),
      created_at: invitation.createdAt ?? null,
    };
  }

  toApplicationManagementResponse(
    invitation: ApplicationUserRegistrationInvitationDto,
  ) {
    return {
      invitation_id: invitation.invitationId,
      email: invitation.email,
      status: invitation.status,
      status_name: this.enumNameService.getEnumName(
        `USER_REGISTRATION_INVITATION.STATUS.${invitation.status}`,
      ),
      system_role: invitation.systemRole,
      system_role_name: this.enumNameService.getEnumName(
        `USER.ROLE.${invitation.systemRole}`,
      ),
      role_id: invitation.roleId,
      role_name: invitation.roleName,
      is_internal_staff: invitation.isInternalStaff,
      user_data: this.mapUserData(invitation.userData),
      invited_by_user_id: invitation.invitedByUserId,
      created_at: invitation.createdAt ?? null,
      consumed_at: invitation.consumedAt ?? null,
      revoked_at: invitation.revokedAt,
      revoked_by_user_id: invitation.revokedByUserId,
      email_delivery: {
        last_attempt_at: invitation.emailDelivery.lastAttemptAt,
        last_attempt_status: invitation.emailDelivery.lastAttemptStatus,
      },
      resend_count: invitation.resendCount,
      ...(invitation.customers === undefined
        ? {}
        : {
            customers: invitation.customers.map((customer) => ({
              customer_id: customer.id,
              company_name: customer.companyName,
              status: customer.status,
              status_name: this.enumNameService.getEnumName(
                `CUSTOMER.STATUS.${customer.status}`,
              ),
            })),
          }),
    };
  }

  toApplicationManagementCollection(
    invitations: ApplicationUserRegistrationInvitationDto[],
  ) {
    return invitations.map((invitation) =>
      this.toApplicationManagementResponse(invitation),
    );
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
