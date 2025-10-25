import {
  ServiceEntryCreatedNotificationDto,
  UserRegistrationInvitationEmailDto,
  UserWelcomeEmailDto,
} from '@application/dto/notification';

export interface IEmailService {
  sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void>;
  sendUserRegistrationInvitation(
    payload: UserRegistrationInvitationEmailDto,
  ): Promise<void>;
  sendServiceEntryCreated(
    payload: ServiceEntryCreatedNotificationDto,
  ): Promise<void>;
}

export const IEmailServiceToken = Symbol('IEmailService');
