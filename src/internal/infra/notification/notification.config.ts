import { IEmailServiceToken, ISmsServiceToken } from '@domain/ports/services';

import { SnsSmsService } from './services/aws-sns-sms/sns-sms.service';
import { MailerEmailService } from './services/mailer-email/mailer-email.service';

export const NotificationServicesConfig = [
  {
    provide: IEmailServiceToken,
    useClass: MailerEmailService,
  },
  {
    provide: ISmsServiceToken,
    useClass: SnsSmsService,
  },
];

export const NotificationServiceTokens = [IEmailServiceToken, ISmsServiceToken];
