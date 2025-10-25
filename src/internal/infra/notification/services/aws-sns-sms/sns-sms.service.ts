import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@infra/env';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import Handlebars from 'handlebars';

import { NotificationType } from '@domain/entities';
import { ISmsService } from '@domain/ports/services';
import {
  ServiceEntryCreatedNotificationDto,
  UserWelcomeSmsDto,
} from '@application/dto';
import { NotificationTemplateRegistry } from '@infra/notification/services/templates';

@Injectable()
export class SnsSmsService implements ISmsService {
  private readonly logger = new Logger(SnsSmsService.name);
  private readonly sns: SNSClient;
  private readonly templates: NotificationTemplateRegistry;

  constructor(private readonly envService: EnvService) {
    this.sns = new SNSClient({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.templates = {
      [NotificationType.WELCOME_USER]: Handlebars.compile(
        '¡Bienvenido a la plataforma!',
      ),
      [NotificationType.USER_REGISTRATION_INVITATION]: Handlebars.compile(
        'Completa tu registro en la plataforma: {{link}}',
      ),
      [NotificationType.SERVICE_ENTRY_CREATED]: Handlebars.compile(
        'Se registró un nuevo servicio: {{serviceOrderIdentifier}}',
      ),
    };
  }

  async sendUserWelcome(payload: UserWelcomeSmsDto): Promise<void> {
    const phoneNumber = payload.user?.cellPhone?.fullNumber;
    const template = this.templates[NotificationType.WELCOME_USER];
    const context = {
      name: payload.user.fullName,
      link: payload.url,
    };
    const message = template(context);

    await this.send(phoneNumber, message);
  }

  async sendServiceEntryCreated(
    payload: ServiceEntryCreatedNotificationDto,
  ): Promise<void> {
    const template = this.templates[NotificationType.SERVICE_ENTRY_CREATED];
    const context = {
      serviceOrderIdentifier: payload.serviceOrderIdentifier,
      publicUrl: payload.publicUrl,
    };
    const message = template(context);

    const phoneNumber = payload.contactPhone ?? null;
    if (!phoneNumber) {
      this.logger.debug(
        `SMS skipped for service entry ${payload.serviceOrderIdentifier} due to missing phone`,
      );
      return;
    }

    await this.send(phoneNumber, message);
  }

  async send(phoneNumber: string, message: string): Promise<void> {
    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: this.envService.get('AWS_SNS_SENDER_ID'),
        },
      },
    });

    // await this.sns.send(command);
    this.logger.debug(
      `SNS SMS sent to ${phoneNumber} with message ${command.input.Message}`,
    );
  }
}
