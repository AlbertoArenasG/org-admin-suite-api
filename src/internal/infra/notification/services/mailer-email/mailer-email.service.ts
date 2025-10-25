import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { NotificationType } from '@domain/entities';
import { IEmailService } from '@domain/ports/services';
import {
  ServiceEntryCreatedNotificationDto,
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
    const template =
      this.templates[NotificationType.USER_REGISTRATION_INVITATION];
    const subjectTemplate =
      this.subjects[NotificationType.USER_REGISTRATION_INVITATION];

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

  async sendServiceEntryCreated(
    payload: ServiceEntryCreatedNotificationDto,
  ): Promise<void> {
    const template = this.templates[NotificationType.SERVICE_ENTRY_CREATED];
    const subjectTemplate =
      this.subjects[NotificationType.SERVICE_ENTRY_CREATED];

    const context = {
      companyName: payload.companyName,
      contactName: payload.contactName,
      serviceOrderIdentifier: payload.serviceOrderIdentifier,
      publicUrl: payload.publicUrl,
      year: new Date().getFullYear(),
    };

    const html = template(context);
    const subject = subjectTemplate(context);

    await this.mailerService.sendMail({
      to: payload.contactEmail,
      subject,
      html,
    });

    this.logger.debug(
      `Service entry email sent to ${payload.contactEmail} for order ${payload.serviceOrderIdentifier}`,
    );
  }
}
