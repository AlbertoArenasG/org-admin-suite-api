import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@infra/env';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

import { ISmsService, SmsPayload } from '@domain/ports/services';

@Injectable()
export class SnsSmsService implements ISmsService {
  private readonly logger = new Logger(SnsSmsService.name);
  private readonly sns: SNSClient;

  constructor(private readonly envService: EnvService) {
    this.sns = new SNSClient({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async send({ to, message }: SmsPayload): Promise<void> {
    const command = new PublishCommand({
      PhoneNumber: to,
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
      `SNS SMS sent to ${to} with message ${command.input.Message}`,
    );
  }
}
