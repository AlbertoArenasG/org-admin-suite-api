import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordOperationalStatus,
  CustomerServiceRecordProviderFollowUpEventStatus,
  CustomerServiceRecordProviderFollowUpMaterializationProps,
  CustomerServiceRecordStatus,
} from '@domain/entities';
import { addCustomerServiceRecordInterval } from './customer-service-record-date-only.utils';

@Injectable()
export class CustomerServiceRecordProviderFollowUpMaterializationRefresher {
  refresh(
    record: CustomerServiceRecord,
  ): CustomerServiceRecordProviderFollowUpMaterializationProps[] {
    const previous = record.provider?.followUpMaterialization ?? [];
    const now = new Date();
    const provider = record.provider;
    const isActive =
      record.status === CustomerServiceRecordStatus.ACTIVE &&
      [
        CustomerServiceRecordOperationalStatus.PENDING,
        CustomerServiceRecordOperationalStatus.IN_PROGRESS,
      ].includes(record.operationalStatus);
    if (
      !isActive ||
      !provider?.followUp.enabled ||
      provider.followUp.rules.length === 0 ||
      !provider.deliveredToProviderAt
    ) {
      return previous.map((event) =>
        event.status ===
        CustomerServiceRecordProviderFollowUpEventStatus.PENDING
          ? {
              ...event,
              status:
                CustomerServiceRecordProviderFollowUpEventStatus.INVALIDATED,
              lastMaterializedAt: now,
            }
          : { ...event, lastMaterializedAt: now },
      );
    }

    const currentEvents = provider.followUp.rules.map((rule) => {
      const triggerDate = addCustomerServiceRecordInterval({
        date: provider.deliveredToProviderAt!,
        interval: rule.interval,
      });
      const existing = previous.find(
        (event) =>
          event.sourceRuleId === rule.ruleId &&
          event.triggerDate === triggerDate &&
          event.status !==
            CustomerServiceRecordProviderFollowUpEventStatus.INVALIDATED,
      );
      return (
        existing ?? {
          source: 'EMBEDDED_RULE' as const,
          sourceRuleId: rule.ruleId!,
          triggerDate,
          status: CustomerServiceRecordProviderFollowUpEventStatus.PENDING,
          triggeredAt: null,
          failureReason: null,
          lastMaterializedAt: now,
        }
      );
    });
    const activeKeys = new Set(
      currentEvents.map(
        (event) => `${event.sourceRuleId}:${event.triggerDate}`,
      ),
    );
    const preservedHistory = previous
      .filter(
        (event) =>
          !activeKeys.has(`${event.sourceRuleId}:${event.triggerDate}`),
      )
      .map((event) =>
        event.status ===
        CustomerServiceRecordProviderFollowUpEventStatus.PENDING
          ? {
              ...event,
              status:
                CustomerServiceRecordProviderFollowUpEventStatus.INVALIDATED,
              lastMaterializedAt: now,
            }
          : { ...event, lastMaterializedAt: now },
      );

    return [...preservedHistory, ...currentEvents].sort((left, right) =>
      left.triggerDate.localeCompare(right.triggerDate),
    );
  }
}
