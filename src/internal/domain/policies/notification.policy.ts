import { User, NotificationChannel } from '@domain/entities';

export class UserWelcomeNotificationPolicy {
  static getChannelsFor(user: User): NotificationChannel[] {
    const channels = [NotificationChannel.EMAIL];

    if (user.hasCellPhone) channels.push(NotificationChannel.SMS);

    return channels;
  }
}
