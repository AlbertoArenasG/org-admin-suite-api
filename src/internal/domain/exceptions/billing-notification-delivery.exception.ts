import { DomainException } from './domain.exception';

export enum BillingNotificationDeliveryExceptionCode {
  DELIVERY_FAILED = 'BILLING_NOTIFICATION.DELIVERY_FAILED',
}

export class BillingNotificationDeliveryException extends DomainException {
  private constructor() {
    super(BillingNotificationDeliveryExceptionCode.DELIVERY_FAILED);
  }

  static deliveryFailed(): BillingNotificationDeliveryException {
    return new BillingNotificationDeliveryException();
  }
}
