import { Injectable, Inject } from '@nestjs/common';

import { User } from '@domain/entities';
import {
  INotificationService,
  INotificationServiceToken,
} from '@domain/ports/services';

@Injectable()
export class UserNotifierService {
  constructor(
    @Inject(INotificationServiceToken)
    private readonly notifications: INotificationService,
  ) {}

  async welcome(user: User): Promise<void> {
    await this.notifications.send({
      to: user.email,
      subject: 'Welcome aboard!',
      template: 'welcome-user',
      context: { name: user.name },
    });
  }
}
