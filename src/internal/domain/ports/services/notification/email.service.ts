import {
  InternalAssetMaintenanceProviderFollowUpNotificationDto,
  ServiceEntryCreatedNotificationDto,
  UserRegistrationInvitationEmailDto,
  UserPasswordResetEmailDto,
  UserWelcomeEmailDto,
} from '@application/dto/notification';

export interface IEmailService {
  sendInternalAssetMaintenanceProviderFollowUp(
    payload: InternalAssetMaintenanceProviderFollowUpNotificationDto,
  ): Promise<void>;
  sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void>;
  sendUserRegistrationInvitation(
    payload: UserRegistrationInvitationEmailDto,
  ): Promise<void>;
  sendServiceEntryCreated(
    payload: ServiceEntryCreatedNotificationDto,
  ): Promise<void>;
  sendUserPasswordReset(payload: UserPasswordResetEmailDto): Promise<void>;
}

export const IEmailServiceToken = Symbol('IEmailService');
