import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { NotificationType } from '@domain/entities';
import { UserRegistrationInvitationType } from '@domain/ports/repositories';
import { IEmailService } from '@domain/ports/services';
import {
  UserRegistrationInvitationEmailDto,
  UserWelcomeEmailDto,
} from '@application/dto';

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

  async sendUserRegistrationInvitation(
    payload: UserRegistrationInvitationEmailDto,
  ): Promise<void> {
    const notificationType =
      payload.type === UserRegistrationInvitationType.NEW_USER_REGISTRATION
        ? NotificationType.USER_REGISTRATION_INVITATION
        : NotificationType.TENANT_USER_INVITATION;

    const template = this.templates[notificationType];
    const subjectTemplate = this.subjects[notificationType];

    const recipientName = payload.userData?.name || payload.email;

    const context = {
      name: recipientName,
      link: payload.invitationUrl,
      year: new Date().getFullYear(),
    };

    const html = template(context);
    const subject = subjectTemplate(context);

    await this.mailerService.sendMail({
      to: payload.email,
      subject,
      html,
    });

    this.logger.debug(
      `Invitation email sent to ${payload.email} for scope ${payload.scope}`,
    );
  }
}
