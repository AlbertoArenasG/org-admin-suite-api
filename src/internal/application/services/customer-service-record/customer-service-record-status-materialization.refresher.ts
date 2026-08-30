import { Injectable } from '@nestjs/common';

import {
  CustomerServiceRecord,
  CustomerServiceRecordMaterializationSource,
  CustomerServiceRecordOperationalStatus,
  CustomerServiceRecordStatus,
  CustomerServiceRecordStatusMaterializationProps,
  ExpirationStatusPolicy,
} from '@domain/entities';
import {
  compareCustomerServiceRecordIntervals,
  getCustomerServiceRecordToday,
  subtractCustomerServiceRecordInterval,
} from './customer-service-record-date-only.utils';

type Commitment = 'CUSTOMER_DELIVERY' | 'PROVIDER_RETURN';

@Injectable()
export class CustomerServiceRecordStatusMaterializationRefresher {
  refresh(input: {
    record: CustomerServiceRecord;
    commitment: Commitment;
    policy: ExpirationStatusPolicy | null;
  }): CustomerServiceRecordStatusMaterializationProps | null {
    const now = new Date();
    if (input.record.status === CustomerServiceRecordStatus.DELETED)
      return null;
    if (input.commitment === 'PROVIDER_RETURN' && !input.record.provider) {
      return this.toSystem('NOT_APPLICABLE', now);
    }

    const estimatedDate = this.getEstimatedDate(input.record, input.commitment);
    if (!estimatedDate) {
      return this.toSystem('PENDING_ESTIMATED_DATE', now);
    }

    const systemCode = this.getSystemCode(input.record, estimatedDate);
    if (
      systemCode === 'COMPLETED' ||
      systemCode === 'CANCELLED' ||
      systemCode === 'OVERDUE' ||
      !input.policy ||
      input.policy.rules.length === 0 ||
      !this.isOperational(input.record)
    ) {
      return this.toSystem(systemCode, now);
    }

    const today = getCustomerServiceRecordToday();
    const matched = input.policy.rules
      .map((rule) => ({
        rule,
        effectiveStartDate: subtractCustomerServiceRecordInterval({
          date: estimatedDate,
          interval: rule.startOffset,
        }),
      }))
      .filter((item) => item.effectiveStartDate <= today)
      .sort((left, right) =>
        compareCustomerServiceRecordIntervals(
          left.rule.startOffset,
          right.rule.startOffset,
        ),
      )[0];

    if (!matched) return this.toSystem(systemCode, now);
    return {
      source: CustomerServiceRecordMaterializationSource.POLICY,
      code: `POLICY_RULE_${matched.rule.ruleId!}`,
      effectiveStartDate: matched.effectiveStartDate,
      label: matched.rule.label,
      labelKey: null,
      colorHex: matched.rule.colorHex,
      matchedRule: {
        sourceRuleId: matched.rule.ruleId!,
        startOffset: { ...matched.rule.startOffset },
      },
      lastMaterializedAt: now,
    };
  }

  private getEstimatedDate(
    record: CustomerServiceRecord,
    commitment: Commitment,
  ): string | null {
    if (commitment === 'CUSTOMER_DELIVERY') {
      return record.customerDelivery.estimatedDeliveryAt;
    }
    return record.provider?.estimatedReturnAt ?? null;
  }

  private getSystemCode(
    record: CustomerServiceRecord,
    estimatedDate: string,
  ): 'ON_TIME' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED' {
    if (
      record.operationalStatus ===
      CustomerServiceRecordOperationalStatus.COMPLETED
    )
      return 'COMPLETED';
    if (
      record.operationalStatus ===
      CustomerServiceRecordOperationalStatus.CANCELLED
    )
      return 'CANCELLED';
    return estimatedDate < getCustomerServiceRecordToday()
      ? 'OVERDUE'
      : 'ON_TIME';
  }

  private isOperational(record: CustomerServiceRecord): boolean {
    return [
      CustomerServiceRecordOperationalStatus.PENDING,
      CustomerServiceRecordOperationalStatus.IN_PROGRESS,
    ].includes(record.operationalStatus);
  }

  private toSystem(
    code:
      | 'PENDING_ESTIMATED_DATE'
      | 'NOT_APPLICABLE'
      | 'ON_TIME'
      | 'OVERDUE'
      | 'COMPLETED'
      | 'CANCELLED',
    now: Date,
  ): CustomerServiceRecordStatusMaterializationProps {
    const details = {
      PENDING_ESTIMATED_DATE: {
        label: 'Pending estimated date',
        labelKey:
          'CUSTOMER_SERVICE_RECORD.DERIVED_STATUS.PENDING_ESTIMATED_DATE',
        colorHex: '#6B7280',
      },
      NOT_APPLICABLE: {
        label: 'Not applicable',
        labelKey: 'CUSTOMER_SERVICE_RECORD.DERIVED_STATUS.NOT_APPLICABLE',
        colorHex: '#6B7280',
      },
      ON_TIME: {
        label: 'On time',
        labelKey: 'CUSTOMER_SERVICE_RECORD.DERIVED_STATUS.ON_TIME',
        colorHex: '#22C55E',
      },
      OVERDUE: {
        label: 'Overdue',
        labelKey: 'CUSTOMER_SERVICE_RECORD.DERIVED_STATUS.OVERDUE',
        colorHex: '#EF4444',
      },
      COMPLETED: {
        label: 'Completed',
        labelKey: 'CUSTOMER_SERVICE_RECORD.DERIVED_STATUS.COMPLETED',
        colorHex: '#2563EB',
      },
      CANCELLED: {
        label: 'Cancelled',
        labelKey: 'CUSTOMER_SERVICE_RECORD.DERIVED_STATUS.CANCELLED',
        colorHex: '#6B7280',
      },
    }[code];
    return {
      source: CustomerServiceRecordMaterializationSource.SYSTEM,
      code,
      effectiveStartDate: null,
      label: details.label,
      labelKey: details.labelKey,
      colorHex: details.colorHex,
      matchedRule: null,
      lastMaterializedAt: now,
    };
  }
}
