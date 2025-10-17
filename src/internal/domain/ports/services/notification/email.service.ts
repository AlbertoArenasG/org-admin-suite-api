import { UserWelcomeEmailDto } from '@application/dto/notification';

export interface IEmailService {
  sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void>;
}

export const IEmailServiceToken = Symbol('IEmailService');
