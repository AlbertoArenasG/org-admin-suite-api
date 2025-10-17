import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@infra/env';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import Handlebars from 'handlebars';

import { NotificationType } from '@domain/entities';
import { IEmailService } from '@domain/ports/services';
import { UserWelcomeEmailDto } from '@application/dto';

type TemplateRegistry = Record<string, Handlebars.TemplateDelegate>;

@Injectable()
export class SesEmailService implements IEmailService {
  private readonly logger = new Logger(SesEmailService.name);
  private readonly ses: SESClient;
  private readonly templates: TemplateRegistry;
  private readonly subjects: TemplateRegistry;

  constructor(private readonly envService: EnvService) {
    this.ses = new SESClient({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.templates = {
      [NotificationType.WELCOME_USER]: Handlebars.compile(
        `<h1>Hola {{name}}</h1><p>¡Bienvenido a la plataforma!</p><a>link</a>`,
      ),
    };

    this.subjects = {
      [NotificationType.WELCOME_USER]: Handlebars.compile(
        'Bienvenido a la plataforma',
      ),
    };
  }

  async sendUserWelcome(payload: UserWelcomeEmailDto): Promise<void> {
    const template = this.templates[NotificationType.WELCOME_USER];
    const subject = this.subjects[NotificationType.WELCOME_USER];

    const context = {
      name: payload.user.fullName,
      link: payload.url,
    };
    const html = template(context);

    await this.send(payload.user.email, subject(context), html);
  }

  private async send(
    emailReceipt: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const command = new SendEmailCommand({
      Source: this.envService.get('AWS_SES_FROM_EMAIL'),
      Destination: {
        // TODO: Add email address from payload when mailing service for production is ready
        // ToAddresses: [payload.to],
        ToAddresses: [this.envService.get('AWS_SES_FROM_EMAIL')],
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
