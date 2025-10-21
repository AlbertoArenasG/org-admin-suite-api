import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { NotificationType } from '@domain/entities';
import { IEmailService } from '@domain/ports/services';
import { UserWelcomeEmailDto } from '@application/dto';

import {
  emailSubjects,
  emailTemplates,
  NotificationTemplateRegistry,
} from '@infra/notification/services/templates';

@Injectable()
export class MailerEmailService implements IEmailService {
  private readonly logger = new Logger(MailerEmailService.name);
  private readonly templates: NotificationTemplateRegistry;
  private readonly subjects: NotificationTemplateRegistry;

  constructor(private readonly mailerService: MailerService) {
    this.templates = emailTemplates;
    this.subjects = emailSubjects;
  }

  async sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void> {
    const template = this.templates[NotificationType.WELCOME_USER];
    const subjectTemplate = this.subjects[NotificationType.WELCOME_USER];

    const context = {
      name: payload.user.fullName,
      link: payload.url,
      year: new Date().getFullYear(),
    };

    const html = template(context);
    const subject = subjectTemplate(context);

    await this.mailerService.sendMail({
      to: payload.user?.email,
      subject,
      html,
    });

    this.logger.debug(`Mailer email sent to ${payload.user.email}`);
  }
}
