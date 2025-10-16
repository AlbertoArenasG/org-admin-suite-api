import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@infra/env';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import Handlebars from 'handlebars';

import {
  EmailPayload,
  IEmailService,
} from '@domain/ports/services/email/email.service';

type TemplateRegistry = Record<string, Handlebars.TemplateDelegate>;

@Injectable()
export class SesEmailService implements IEmailService {
  private readonly logger = new Logger(SesEmailService.name);
  private readonly ses: SESClient;
  private readonly templates: TemplateRegistry;

  constructor(private readonly envService: EnvService) {
    this.ses = new SESClient({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.templates = {
      'welcome-user': Handlebars.compile(
        `<h1>Hola {{name}}</h1><p>¡Bienvenido a la plataforma!</p>`,
      ),
    };
  }

  async send(payload: EmailPayload): Promise<void> {
    const template = this.templates[payload.template];

    if (!template) {
      throw new Error(`Template ${payload.template} not registered`);
    }

    const html = template(payload.context);
    const command = new SendEmailCommand({
      Source: this.envService.get('AWS_SES_FROM_EMAIL'),
      Destination: {
        // TODO: Add email address from payload when mailing service for production is ready
        // ToAddresses: [payload.to],
        ToAddresses: [this.envService.get('AWS_SES_FROM_EMAIL')],
      },
      Message: {
        Subject: { Data: payload.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
        },
      },
    });

    await this.ses.send(command);
    this.logger.debug(`SES email sent to ${payload.to}`);
  }
}
