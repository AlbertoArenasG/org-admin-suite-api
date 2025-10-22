import {
  UserRegistrationInvitationEmailDto,
  UserWelcomeEmailDto,
} from '@application/dto/notification';

export interface IEmailService {
  sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void>;
  sendUserRegistrationInvitation(
    payload: UserRegistrationInvitationEmailDto,
  ): Promise<void>;
}

export const IEmailServiceToken = Symbol('IEmailService');
