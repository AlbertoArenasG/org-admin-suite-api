import { NotificationChannel } from '@domain/entities';
import {
  UserWelcomeEmailDto,
  UserWelcomeSmsDto,
} from './notification-welcome-user.dto';
import { ServiceEntryCreatedNotificationDto } from './service-entry-notification.dto';

export interface WelcomeUserNotificationEnvelopeDto {
  channels: NotificationChannel[];
  emailPayload: UserWelcomeEmailDto;
  smsPayload: UserWelcomeSmsDto;
}

export interface ServiceEntryCreatedNotificationEnvelopeDto {
  channels: NotificationChannel[];
  payload: ServiceEntryCreatedNotificationDto;
}
