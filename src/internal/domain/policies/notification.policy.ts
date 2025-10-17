import { User, NotificationChannel } from '@domain/entities';

interface NotificationPolicy {
  getChannelsFor(user: User): NotificationChannel[];
}

export class UserWelcomeNotificationPolicy implements NotificationPolicy {
  getChannelsFor(user: User): NotificationChannel[] {
    const channels = [NotificationChannel.EMAIL];

    if (user.hasCellPhone) channels.push(NotificationChannel.SMS);

    return [NotificationChannel.EMAIL];
  }
}
