import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@infra/env';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { NotificationType } from '@domain/entities';
import { IEmailService } from '@domain/ports/services';
import {
  GenericEmailDto,
  ServiceEntryCreatedNotificationDto,
  UserRegistrationInvitationEmailDto,
  UserPasswordResetEmailDto,
  UserWelcomeEmailDto,
} from '@application/dto';
import {
  emailSubjects,
  emailTemplates,
  NotificationTemplateRegistry,
} from '@infra/notification/services/templates';

@Injectable()
export class SesEmailService implements IEmailService {
  private readonly logger = new Logger(SesEmailService.name);
  private readonly ses: SESClient;
  private readonly templates: NotificationTemplateRegistry;
  private readonly subjects: NotificationTemplateRegistry;

  constructor(private readonly envService: EnvService) {
    this.ses = new SESClient({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.templates = emailTemplates;
    this.subjects = emailSubjects;
  }

  async sendGenericEmail(payload: GenericEmailDto): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.envService.get('AWS_SES_FROM_EMAIL'),
      Destination: {
        ToAddresses: payload.to,
        CcAddresses: payload.cc && payload.cc.length > 0 ? payload.cc : [],
      },
      Message: {
        Subject: { Data: payload.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: payload.html, Charset: 'UTF-8' },
        },
      },
    });

    await this.ses.send(command);
    this.logger.debug(`SES generic email sent to ${payload.to.join(', ')}`);
  }

  async sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void> {
    const template = this.templates[NotificationType.WELCOME_USER];
    const subject = this.subjects[NotificationType.WELCOME_USER];

    const context = {
      name: payload.user.fullName,
      link: payload.url,
      year: new Date().getFullYear(),
    };
    const html = template(context);

    await this.send(payload.user.email, subject(context), html);
  }

  async sendUserRegistrationInvitation(
    payload: UserRegistrationInvitationEmailDto,
  ): Promise<void> {
    const template =
      this.templates[NotificationType.USER_REGISTRATION_INVITATION];
    const subject =
      this.subjects[NotificationType.USER_REGISTRATION_INVITATION];

    const context = {
      name: payload.userData?.name ?? payload.email,
      link: payload.invitationUrl,
      year: new Date().getFullYear(),
    };

    const html = template(context);

    await this.send(payload.email, subject(context), html);
  }

  async sendServiceEntryCreated(
    payload: ServiceEntryCreatedNotificationDto,
  ): Promise<void> {
    const template = this.templates[NotificationType.SERVICE_ENTRY_CREATED];
    const subject = this.subjects[NotificationType.SERVICE_ENTRY_CREATED];

    const context = {
      companyName: payload.companyName,
      contactName: payload.contactName,
      serviceOrderIdentifier: payload.serviceOrderIdentifier,
      publicUrl: payload.publicUrl,
      year: new Date().getFullYear(),
    };

    const html = template(context);

    await this.send(payload.contactEmail, subject(context), html);
  }

  async sendUserPasswordReset(
    payload: UserPasswordResetEmailDto,
  ): Promise<void> {
    const template = this.templates[NotificationType.USER_PASSWORD_RESET];
    const subject = this.subjects[NotificationType.USER_PASSWORD_RESET];

    const context = {
      name: payload.fullName,
      link: payload.resetUrl,
      year: new Date().getFullYear(),
    };

    const html = template(context);

    await this.send(payload.email, subject(context), html);
  }

  private async send(
    emailReceipt: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.envService.get('AWS_SES_FROM_EMAIL'),
      Destination: {
        ToAddresses: [emailReceipt],
      },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
        },
      },
    });

    await this.ses.send(command);
    this.logger.debug(`SES email sent to ${emailReceipt}`);
  }
}
