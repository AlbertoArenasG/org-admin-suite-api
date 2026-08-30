import { Inject, Injectable } from '@nestjs/common';

import { CustomerServiceRecord } from '@domain/entities';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
} from '@domain/ports/repositories';
import { CustomerServiceRecordNotificationMaterializationRefresher } from './customer-service-record-notification-materialization.refresher';
import { CustomerServiceRecordProviderFollowUpMaterializationRefresher } from './customer-service-record-provider-follow-up-materialization.refresher';
import { CustomerServiceRecordStatusMaterializationRefresher } from './customer-service-record-status-materialization.refresher';

export interface RefreshCustomerServiceRecordMaterializationsInput {
  records: CustomerServiceRecord[];
  customerDeliveryStatus: boolean;
  customerDeliveryNotification: boolean;
  providerStatus: boolean;
  providerNotification: boolean;
  providerFollowUp: boolean;
}

@Injectable()
export class CustomerServiceRecordTechnicalMaterializationsRefresherService {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly recordReadRepository: ICustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly recordWriteRepository: ICustomerServiceRecordWriteRepository,
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly statusPolicyReadRepository: IExpirationStatusPolicyReadRepository,
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly notificationPolicyReadRepository: IExpirationNotificationPolicyReadRepository,
    private readonly statusRefresher: CustomerServiceRecordStatusMaterializationRefresher,
    private readonly notificationRefresher: CustomerServiceRecordNotificationMaterializationRefresher,
    private readonly providerFollowUpRefresher: CustomerServiceRecordProviderFollowUpMaterializationRefresher,
  ) {}

  async refresh(
    input: RefreshCustomerServiceRecordMaterializationsInput,
  ): Promise<void> {
    const statusPolicies = await this.loadStatusPolicies(input.records);
    const notificationPolicies = await this.loadNotificationPolicies(
      input.records,
    );
    for (const record of input.records) {
      await this.recordWriteRepository.updateMaterializations({
        recordId: record.id,
        ...(input.customerDeliveryStatus
          ? {
              customerDelivery: {
                statusMaterialization: this.statusRefresher.refresh({
                  record,
                  commitment: 'CUSTOMER_DELIVERY',
                  policy: record.customerDelivery.statusPolicyId
                    ? (statusPolicies.get(
                        record.customerDelivery.statusPolicyId,
                      ) ?? null)
                    : null,
                }),
              },
            }
          : {}),
        ...(input.customerDeliveryNotification
          ? {
              customerDelivery: {
                ...(input.customerDeliveryStatus
                  ? {
                      statusMaterialization: this.statusRefresher.refresh({
                        record,
                        commitment: 'CUSTOMER_DELIVERY',
                        policy: record.customerDelivery.statusPolicyId
                          ? (statusPolicies.get(
                              record.customerDelivery.statusPolicyId,
                            ) ?? null)
                          : null,
                      }),
                    }
                  : {}),
                notificationMaterialization: this.notificationRefresher.refresh(
                  {
                    record,
                    commitment: 'CUSTOMER_DELIVERY',
                    policy: record.customerDelivery.notificationPolicyId
                      ? (notificationPolicies.get(
                          record.customerDelivery.notificationPolicyId,
                        ) ?? null)
                      : null,
                  },
                ),
              },
            }
          : {}),
        ...(record.provider &&
        (input.providerStatus ||
          input.providerNotification ||
          input.providerFollowUp)
          ? {
              provider: {
                ...(input.providerStatus
                  ? {
                      statusMaterialization: this.statusRefresher.refresh({
                        record,
                        commitment: 'PROVIDER_RETURN',
                        policy: record.provider?.statusPolicyId
                          ? (statusPolicies.get(
                              record.provider.statusPolicyId,
                            ) ?? null)
                          : null,
                      }),
                    }
                  : {}),
                ...(input.providerNotification
                  ? {
                      notificationMaterialization:
                        this.notificationRefresher.refresh({
                          record,
                          commitment: 'PROVIDER_RETURN',
                          policy: record.provider?.notificationPolicyId
                            ? (notificationPolicies.get(
                                record.provider.notificationPolicyId,
                              ) ?? null)
                            : null,
                        }),
                    }
                  : {}),
                ...(input.providerFollowUp
                  ? {
                      followUpMaterialization:
                        this.providerFollowUpRefresher.refresh(record),
                    }
                  : {}),
              },
            }
          : {}),
      });
    }
  }

  async refreshOperational(input: {
    commitment: 'CUSTOMER_DELIVERY' | 'PROVIDER_RETURN';
    statusPolicyId?: string | null;
    notificationPolicyId?: string | null;
    customerDeliveryStatus: boolean;
    customerDeliveryNotification: boolean;
    providerStatus: boolean;
    providerNotification: boolean;
    providerFollowUp: boolean;
  }): Promise<void> {
    let after: { createdAt: Date; recordId: string } | undefined;
    do {
      const { data } = await this.recordReadRepository.findOperational({
        after,
        limit: 100,
        statusPolicyId: input.statusPolicyId,
        notificationPolicyId: input.notificationPolicyId,
        commitment: input.commitment,
      });
      await this.refresh({ ...input, records: data });
      const last = data.at(-1);
      after = last?.createdAt
        ? { createdAt: last.createdAt, recordId: last.id }
        : undefined;
      if (data.length < 100) return;
    } while (after);
  }

  private async loadStatusPolicies(records: CustomerServiceRecord[]) {
    const ids = Array.from(
      new Set(
        records
          .flatMap((record) => [
            record.customerDelivery.statusPolicyId,
            record.provider?.statusPolicyId ?? null,
          ])
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const entries = await Promise.all(
      ids.map(
        async (id) =>
          [
            id,
            (await this.statusPolicyReadRepository.findById(id)).data,
          ] as const,
      ),
    );
    return new Map(
      entries.filter(
        (entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
          Boolean(entry[1]),
      ),
    );
  }

  private async loadNotificationPolicies(records: CustomerServiceRecord[]) {
    const ids = Array.from(
      new Set(
        records
          .flatMap((record) => [
            record.customerDelivery.notificationPolicyId,
            record.provider?.notificationPolicyId ?? null,
          ])
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const entries = await Promise.all(
      ids.map(
        async (id) =>
          [
            id,
            (await this.notificationPolicyReadRepository.findById(id)).data,
          ] as const,
      ),
    );
    return new Map(
      entries.filter(
        (entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
          Boolean(entry[1]),
      ),
    );
  }
}
