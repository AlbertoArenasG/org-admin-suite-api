import {
  ServiceEntryCreatedNotificationDto,
  UserWelcomeSmsDto,
} from '@application/dto/notification';

export interface ISmsService {
  sendUserWelcome(payload: UserWelcomeSmsDto): Promise<void>;
  sendServiceEntryCreated(
    payload: ServiceEntryCreatedNotificationDto,
  ): Promise<void>;
}

export const ISmsServiceToken = Symbol('ISmsService');
