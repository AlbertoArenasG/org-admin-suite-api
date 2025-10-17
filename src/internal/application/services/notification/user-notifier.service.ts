import { Injectable } from '@nestjs/common';

import { NotificationType, User } from '@domain/entities';
import { UserWelcomeNotificationPolicy } from '@domain/policies';
import { MultiChannelNotificationService } from '@application/services/notification';
import { WelcomeUserNotificationEnvelopeDto } from '@application/dto';

@Injectable()
export class UserNotifierService {
  constructor(
    private readonly notificationService: MultiChannelNotificationService,
  ) {}

  async notify(user: User, notificationType: NotificationType): Promise<void> {
    if (notificationType === NotificationType.WELCOME_USER) {
      await this.welcomeUser(user);
    }
  }

  async welcomeUser(user: User): Promise<void> {
    const channels = UserWelcomeNotificationPolicy.getChannelsFor(user);

    const welcomeUrl = 'https://example.com';
    const payload = {
      user,
      url: welcomeUrl,
    };

    const envelope: WelcomeUserNotificationEnvelopeDto = {
      channels,
      emailPayload: payload,
      smsPayload: payload,
    };

    await this.notificationService.sendUserWelcome(envelope);
  }
}
