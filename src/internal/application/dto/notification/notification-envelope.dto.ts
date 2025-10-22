import { NotificationChannel } from '@domain/entities';
import {
  UserWelcomeEmailDto,
  UserWelcomeSmsDto,
} from './notification-welcome-user.dto';

export interface WelcomeUserNotificationEnvelopeDto {
  channels: NotificationChannel[];
  emailPayload: UserWelcomeEmailDto;
  smsPayload: UserWelcomeSmsDto;
}
