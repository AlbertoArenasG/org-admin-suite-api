import { UserWelcomeSmsDto } from '@application/dto/notification';

export interface ISmsService {
  sendUserWelcome(payload: UserWelcomeSmsDto): Promise<void>;
}

export const ISmsServiceToken = Symbol('ISmsService');
