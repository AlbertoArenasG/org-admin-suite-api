import { IEmailServiceToken, ISmsServiceToken } from '@domain/ports/services';

import { SesEmailService } from './services/aws-ses-email/ses-email.service';
import { SnsSmsService } from './services/aws-sns-sms/sns-sms.service';

export const NotificationServicesConfig = [
  {
    provide: IEmailServiceToken,
    useClass: SesEmailService,
  },
  {
    provide: ISmsServiceToken,
    useClass: SnsSmsService,
  },
];

export const NotificationServiceTokens = [IEmailServiceToken, ISmsServiceToken];
