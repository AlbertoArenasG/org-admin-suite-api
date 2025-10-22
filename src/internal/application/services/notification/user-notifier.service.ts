import { Injectable } from '@nestjs/common';

import { NotificationType, User } from '@domain/entities';
import { UserWelcomeNotificationPolicy } from '@domain/policies';
import { MultiChannelNotificationService } from '@application/services/notification';
import { WelcomeUserNotificationEnvelopeDto } from '@application/dto';
import { EnvService } from '@infra/env';

@Injectable()
export class UserNotifierService {
  constructor(
    private readonly notificationService: MultiChannelNotificationService,
    private readonly envService: EnvService,
  ) {}

  async notify(user: User, notificationType: NotificationType): Promise<void> {
    if (notificationType === NotificationType.WELCOME_USER) {
      await this.welcomeUser(user);
    }
  }

  async welcomeUser(user: User): Promise<void> {
    const channels = UserWelcomeNotificationPolicy.getChannelsFor(user);

    const baseUrl = this.envService.get('USER_WELCOME_BASE_URL');
    const payload = {
      user,
      url: baseUrl,
    };

    const envelope: WelcomeUserNotificationEnvelopeDto = {
      channels,
      emailPayload: payload,
      smsPayload: payload,
    };

    await this.notificationService.sendUserWelcome(envelope);
  }
}
