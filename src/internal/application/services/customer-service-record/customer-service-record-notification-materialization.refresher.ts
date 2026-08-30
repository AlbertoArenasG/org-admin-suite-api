import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordMaterializationSource,
  CustomerServiceRecordNotificationMaterializationProps,
  CustomerServiceRecordNotificationTriggerEventStatus,
  CustomerServiceRecordOperationalStatus,
  CustomerServiceRecordStatus,
  ExpirationNotificationPolicy,
  ExpirationNotificationPolicyAnchor,
  ExpirationNotificationPolicyRepeatUntil,
  ExpirationNotificationPolicyRuleProps,
  ExpirationNotificationPolicyTriggerMode,
} from '@domain/entities';
import {
  addCustomerServiceRecordInterval,
  subtractCustomerServiceRecordInterval,
} from './customer-service-record-date-only.utils';

type Commitment = 'CUSTOMER_DELIVERY' | 'PROVIDER_RETURN';

@Injectable()
export class CustomerServiceRecordNotificationMaterializationRefresher {
  refresh(input: {
    record: CustomerServiceRecord;
    commitment: Commitment;
    policy: ExpirationNotificationPolicy | null;
  }): CustomerServiceRecordNotificationMaterializationProps | null {
    const previous = this.getPrevious(input.record, input.commitment);
    const now = new Date();
    const estimatedDate = this.getEstimatedDate(input.record, input.commitment);
    if (
      input.record.status === CustomerServiceRecordStatus.DELETED ||
      !this.isOperational(input.record)
    ) {
      return this.invalidate(previous, now);
    }
    if (!estimatedDate || !input.policy || input.policy.rules.length === 0) {
      return this.empty(previous, now);
    }

    const materializedRules = input.policy.rules.map((rule) => {
      const previousRule = previous?.materializedRules.find(
        (item) => item.sourceRuleId === rule.ruleId,
      );
      const triggerEvents = this.getTriggerDates(rule, estimatedDate).map(
        (triggerDate) => {
          const previousEvent = previousRule?.triggerEvents.find(
            (event) =>
              event.triggerDate === triggerDate &&
              event.status !==
                CustomerServiceRecordNotificationTriggerEventStatus.INVALIDATED,
          );
          return (
            previousEvent ?? {
              triggerDate,
              status:
                CustomerServiceRecordNotificationTriggerEventStatus.PENDING,
              triggeredAt: null,
              failureReason: null,
            }
          );
        },
      );
      return {
        sourceRuleId: rule.ruleId!,
        anchor: rule.anchor,
        startOffset: { ...rule.startOffset },
        triggerMode: rule.triggerMode,
        repeatEvery: rule.repeatEvery ? { ...rule.repeatEvery } : null,
        repeatUntil: rule.repeatUntil ?? null,
        repeatFor: rule.repeatFor ? { ...rule.repeatFor } : null,
        triggerEvents,
        lastTriggeredAt:
          triggerEvents
            .map((event) => event.triggeredAt)
            .filter((value): value is Date => Boolean(value))
            .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
      };
    });
    const pendingEvents = materializedRules
      .flatMap((rule) => rule.triggerEvents)
      .filter(
        (event) =>
          event.status ===
          CustomerServiceRecordNotificationTriggerEventStatus.PENDING,
      )
      .sort((left, right) => left.triggerDate.localeCompare(right.triggerDate));

    return {
      source: CustomerServiceRecordMaterializationSource.POLICY,
      nextTriggerDate: pendingEvents[0]?.triggerDate ?? null,
      lastTriggeredAt:
        materializedRules
          .map((rule) => rule.lastTriggeredAt)
          .filter((value): value is Date => Boolean(value))
          .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
      materializedRulesCount: materializedRules.length,
      materializedRules,
      lastMaterializedAt: now,
    };
  }

  private getEstimatedDate(
    record: CustomerServiceRecord,
    commitment: Commitment,
  ): string | null {
    return commitment === 'CUSTOMER_DELIVERY'
      ? record.customerDelivery.estimatedDeliveryAt
      : (record.provider?.estimatedReturnAt ?? null);
  }

  private getPrevious(
    record: CustomerServiceRecord,
    commitment: Commitment,
  ): CustomerServiceRecordNotificationMaterializationProps | null {
    return commitment === 'CUSTOMER_DELIVERY'
      ? record.customerDelivery.notificationMaterialization
      : (record.provider?.notificationMaterialization ?? null);
  }

  private isOperational(record: CustomerServiceRecord): boolean {
    return [
      CustomerServiceRecordOperationalStatus.PENDING,
      CustomerServiceRecordOperationalStatus.IN_PROGRESS,
    ].includes(record.operationalStatus);
  }

  private empty(
    previous: CustomerServiceRecordNotificationMaterializationProps | null,
    now: Date,
  ): CustomerServiceRecordNotificationMaterializationProps {
    return {
      source: CustomerServiceRecordMaterializationSource.SYSTEM,
      nextTriggerDate: null,
      lastTriggeredAt: previous?.lastTriggeredAt ?? null,
      materializedRulesCount: 0,
      materializedRules: [],
      lastMaterializedAt: now,
    };
  }

  private invalidate(
    previous: CustomerServiceRecordNotificationMaterializationProps | null,
    now: Date,
  ): CustomerServiceRecordNotificationMaterializationProps | null {
    if (!previous) return null;
    return {
      ...previous,
      nextTriggerDate: null,
      materializedRules: previous.materializedRules.map((rule) => ({
        ...rule,
        triggerEvents: rule.triggerEvents.map((event) =>
          event.status ===
          CustomerServiceRecordNotificationTriggerEventStatus.PENDING
            ? {
                ...event,
                status:
                  CustomerServiceRecordNotificationTriggerEventStatus.INVALIDATED,
              }
            : event,
        ),
      })),
      lastMaterializedAt: now,
    };
  }

  private getTriggerDates(
    rule: ExpirationNotificationPolicyRuleProps,
    estimatedDate: string,
  ): string[] {
    const startDate =
      rule.anchor === ExpirationNotificationPolicyAnchor.BEFORE_EXPIRATION
        ? subtractCustomerServiceRecordInterval({
            date: estimatedDate,
            interval: rule.startOffset,
          })
        : addCustomerServiceRecordInterval({
            date: estimatedDate,
            interval: rule.startOffset,
          });
    if (rule.triggerMode === ExpirationNotificationPolicyTriggerMode.ONE_TIME)
      return [startDate];
    if (!rule.repeatUntil || !rule.repeatEvery) return [startDate];

    const dates = [startDate];
    let cursor = startDate;
    while (dates.length < 100) {
      cursor = addCustomerServiceRecordInterval({
        date: cursor,
        interval: rule.repeatEvery,
      });
      if (
        rule.repeatUntil ===
          ExpirationNotificationPolicyRepeatUntil.EXPIRATION_DATE &&
        cursor > estimatedDate
      )
        break;
      if (
        rule.repeatUntil ===
          ExpirationNotificationPolicyRepeatUntil.FIXED_DURATION &&
        rule.repeatFor &&
        cursor >
          addCustomerServiceRecordInterval({
            date: startDate,
            interval: rule.repeatFor,
          })
      )
        break;
      dates.push(cursor);
      if (
        rule.repeatUntil ===
        ExpirationNotificationPolicyRepeatUntil.STATUS_CHANGES
      )
        break;
    }
    return dates;
  }
}
