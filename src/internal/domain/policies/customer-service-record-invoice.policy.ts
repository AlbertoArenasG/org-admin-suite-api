import {
  CustomerServiceRecordBillingProps,
  CustomerServiceRecordIntervalProps,
  CustomerServiceRecordInvoiceStatus,
} from '@domain/entities/customer-service-record.entity';

/** Pure calendar rules; dates are local ISO days (YYYY-MM-DD). */
export class CustomerServiceRecordInvoicePolicy {
  static addPaymentTerm(
    day: string,
    term: CustomerServiceRecordIntervalProps,
  ): string {
    const [year, month, date] = day.split('-').map(Number);
    const monthIndex = month - 1 + term.months + term.years * 12;
    const targetYear = year + Math.floor(monthIndex / 12);
    const targetMonth = ((monthIndex % 12) + 12) % 12;
    const lastDay = new Date(
      Date.UTC(targetYear, targetMonth + 1, 0),
    ).getUTCDate();
    const result = new Date(
      Date.UTC(targetYear, targetMonth, Math.min(date, lastDay)),
    );
    result.setUTCDate(result.getUTCDate() + term.weeks * 7 + term.days);
    return result.toISOString().slice(0, 10);
  }

  static afterDetailsChange(
    current: CustomerServiceRecordBillingProps,
    changes: Partial<Omit<CustomerServiceRecordBillingProps, 'instructions'>>,
    today: string,
  ): CustomerServiceRecordBillingProps {
    const next = { ...current, ...changes };
    const sourceChanged =
      changes.deliveredAt !== undefined || changes.paymentTerm !== undefined;
    if (
      sourceChanged &&
      changes.estimatedPaymentAt === undefined &&
      next.deliveredAt &&
      next.paymentTerm
    ) {
      next.estimatedPaymentAt = this.addPaymentTerm(
        next.deliveredAt,
        next.paymentTerm,
      );
    }
    if (changes.issuedAt !== undefined) {
      next.invoiceStatus = changes.issuedAt
        ? CustomerServiceRecordInvoiceStatus.IN_PROCESS_PAYMENT
        : CustomerServiceRecordInvoiceStatus.PENDING;
    }
    if (
      next.invoiceStatus === CustomerServiceRecordInvoiceStatus.OVERDUE &&
      next.estimatedPaymentAt &&
      next.estimatedPaymentAt >= today
    ) {
      next.invoiceStatus =
        CustomerServiceRecordInvoiceStatus.IN_PROCESS_PAYMENT;
    }
    return next;
  }

  static isOverdue(
    billing: CustomerServiceRecordBillingProps,
    today: string,
  ): boolean {
    return (
      !!billing.estimatedPaymentAt &&
      billing.estimatedPaymentAt < today &&
      billing.invoiceStatus !== CustomerServiceRecordInvoiceStatus.PAID &&
      billing.invoiceStatus !== CustomerServiceRecordInvoiceStatus.CANCELLED &&
      billing.invoiceStatus !== CustomerServiceRecordInvoiceStatus.REJECTED
    );
  }
}
