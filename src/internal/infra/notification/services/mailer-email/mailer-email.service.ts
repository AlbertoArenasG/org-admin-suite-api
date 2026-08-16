import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { NotificationType } from '@domain/entities';
import { IEmailService } from '@domain/ports/services';
import {
  InternalAssetMaintenanceProviderFollowUpNotificationDto,
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
export class MailerEmailService implements IEmailService {
  private readonly logger = new Logger(MailerEmailService.name);
  private readonly templates: NotificationTemplateRegistry;
  private readonly subjects: NotificationTemplateRegistry;

  constructor(private readonly mailerService: MailerService) {
    this.templates = emailTemplates;
    this.subjects = emailSubjects;
  }

  async sendInternalAssetMaintenanceProviderFollowUp(
    payload: InternalAssetMaintenanceProviderFollowUpNotificationDto,
  ): Promise<void> {
    const template =
      this.templates[
        NotificationType.INTERNAL_ASSET_MAINTENANCE_PROVIDER_FOLLOW_UP
      ];
    const subjectTemplate =
      this.subjects[
        NotificationType.INTERNAL_ASSET_MAINTENANCE_PROVIDER_FOLLOW_UP
      ];

    const context = {
      providerName: payload.providerName ?? null,
      assetName: payload.assetName,
      assetIdentifier: payload.assetIdentifier,
      assetMaintenanceType: payload.assetMaintenanceType,
      expirationDate: payload.expirationDate,
      year: new Date().getFullYear(),
    };

    const html = template(context);
    const subject = subjectTemplate(context);

    await this.mailerService.sendMail({
      to: payload.to,
      cc: payload.cc && payload.cc.length > 0 ? payload.cc : undefined,
      subject,
      html,
    });

    this.logger.debug(
      `Provider follow-up email sent to ${payload.to.join(', ')}`,
    );
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

  async sendUserPasswordReset(
    payload: UserPasswordResetEmailDto,
  ): Promise<void> {
    const template = this.templates[NotificationType.USER_PASSWORD_RESET];
    const subjectTemplate = this.subjects[NotificationType.USER_PASSWORD_RESET];

    const context = {
      name: payload.fullName,
      link: payload.resetUrl,
      year: new Date().getFullYear(),
    };

    const html = template(context);
    const subject = subjectTemplate(context);

    await this.mailerService.sendMail({
      to: payload.email,
      subject,
      html,
    });

    this.logger.debug(`Password reset email sent to ${payload.email}`);
  }
}
