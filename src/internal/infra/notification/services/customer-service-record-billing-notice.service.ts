import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import {
  CustomerServiceRecordBillingNotice,
  ICustomerServiceRecordBillingNoticeSender,
} from '@domain/ports/services';
import { EnvService } from '@infra/env';
import { customerServiceRecordBillingNoticeTemplate } from './templates/customer-service-record-billing-notice.template';

@Injectable()
export class MailerCustomerServiceRecordBillingNoticeSender
  implements ICustomerServiceRecordBillingNoticeSender
{
  private readonly logger = new Logger(
    MailerCustomerServiceRecordBillingNoticeSender.name,
  );

  constructor(
    private readonly mailerService: MailerService,
    private readonly envService: EnvService,
  ) {}

  async send(notice: CustomerServiceRecordBillingNotice): Promise<boolean> {
    const configuredTo = this.envService.get(
      'BILLING_NOTIFICATION_RECIPIENTS_TO',
    );
    const configuredCc = this.envService.get(
      'BILLING_NOTIFICATION_RECIPIENTS_CC',
    );
    if (configuredTo.length === 0 && configuredCc.length === 0) {
      this.logger.log('Billing notice skipped: no recipients configured');
      return false;
    }

    const content = customerServiceRecordBillingNoticeTemplate(notice);
    // A CC-only configuration still delivers the notice to those addresses.
    const to = configuredTo.length > 0 ? configuredTo : configuredCc;
    const cc = configuredTo.length > 0 ? configuredCc : [];
    const result: unknown = await this.mailerService.sendMail({
      to,
      ...(cc.length > 0 ? { cc } : {}),
      subject: content.subject,
      text: content.text,
    });

    const response = result as {
      accepted?: unknown;
      rejected?: unknown;
    } | null;
    const accepted = Array.isArray(response?.accepted)
      ? response.accepted.filter(
          (item): item is string => typeof item === 'string',
        )
      : [];
    const rejected = Array.isArray(response?.rejected) ? response.rejected : [];
    const acceptedAddresses = new Set(
      accepted.map((email) => email.toLowerCase()),
    );
    if (
      rejected.length > 0 ||
      ![...to, ...cc].every((email) =>
        acceptedAddresses.has(email.toLowerCase()),
      )
    ) {
      throw new Error('Billing notice was not accepted by the mail provider');
    }
    this.logger.log(
      `Billing notice accepted for record ${notice.serviceNumberDisplay}`,
    );
    return true;
  }
}
