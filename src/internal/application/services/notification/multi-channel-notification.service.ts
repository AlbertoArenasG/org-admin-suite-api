import { Inject, Injectable } from '@nestjs/common';

import {
  IEmailService,
  IEmailServiceToken,
  ISmsService,
  ISmsServiceToken,
} from '@domain/ports/services';
import { NotificationChannel } from '@src/internal/domain/entities';
import { WelcomeUserNotificationEnvelopeDto } from '@application/dto/notification';

@Injectable()
export class MultiChannelNotificationService {
  constructor(
    @Inject(IEmailServiceToken)
    private readonly emailService: IEmailService,
    @Inject(ISmsServiceToken)
    private readonly smsService: ISmsService,
  ) {}

  async sendUserWelcome(
    envelope: WelcomeUserNotificationEnvelopeDto,
  ): Promise<void> {
    const { channels, emailPayload, smsPayload } = envelope;
    const tasks: Promise<unknown>[] = [];
    const sendEmailTask = this.emailService.sendUserWelcome(emailPayload);
    const sendSmsTask = this.smsService.sendUserWelcome(smsPayload);

    if (channels.includes(NotificationChannel.EMAIL)) tasks.push(sendEmailTask);

    if (channels.includes(NotificationChannel.SMS)) tasks.push(sendSmsTask);

    await Promise.all(tasks);
  }
}
