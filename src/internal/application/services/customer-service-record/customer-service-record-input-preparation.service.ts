import { Inject, Injectable } from '@nestjs/common';

import {
  CustomerServiceRecordCustomerDeliveryInputDto,
  CustomerServiceRecordCustomerInputDto,
  CustomerServiceRecordProviderInputDto,
} from '@application/dto';
import {
  CustomerServiceRecordCustomerDeliveryProps,
  CustomerServiceRecordCustomerProps,
  CustomerServiceRecordProviderProps,
  CustomerServiceRecordServiceTypeStatus,
  CustomerServiceRecordIntervalProps,
  CustomerStatus,
  ExpirationNotificationPolicyStatus,
  ExpirationStatusPolicyStatus,
  ProviderStatus,
  RecipientGroupStatus,
} from '@domain/entities';
import {
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  ICustomerServiceRecordServiceTypeReadRepository,
  ICustomerServiceRecordServiceTypeReadRepositoryToken,
  IExpirationNotificationPolicyReadRepository,
  IExpirationNotificationPolicyReadRepositoryToken,
  IExpirationStatusPolicyReadRepository,
  IExpirationStatusPolicyReadRepositoryToken,
  IProviderReadRepository,
  IProviderReadRepositoryToken,
  IRecipientGroupReadRepository,
  IRecipientGroupReadRepositoryToken,
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { addCustomerServiceRecordInterval } from './customer-service-record-date-only.utils';

@Injectable()
export class CustomerServiceRecordInputPreparationService {
  constructor(
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    @Inject(IProviderReadRepositoryToken)
    private readonly providerReadRepository: IProviderReadRepository,
    @Inject(ICustomerServiceRecordServiceTypeReadRepositoryToken)
    private readonly serviceTypeReadRepository: ICustomerServiceRecordServiceTypeReadRepository,
    @Inject(IExpirationStatusPolicyReadRepositoryToken)
    private readonly statusPolicyReadRepository: IExpirationStatusPolicyReadRepository,
    @Inject(IExpirationNotificationPolicyReadRepositoryToken)
    private readonly notificationPolicyReadRepository: IExpirationNotificationPolicyReadRepository,
    @Inject(IRecipientGroupReadRepositoryToken)
    private readonly recipientGroupReadRepository: IRecipientGroupReadRepository,
  ) {}

  async prepareServiceType(code: string) {
    const { data } = await this.serviceTypeReadRepository.findByCode(
      code.trim(),
    );
    if (!data || data.status !== CustomerServiceRecordServiceTypeStatus.ACTIVE)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER_SERVICE_RECORD_SERVICE_TYPE,
        { code },
      );
    return { serviceTypeCode: data.code, serviceTypeName: data.name };
  }

  async prepareCustomer(
    input: CustomerServiceRecordCustomerInputDto,
  ): Promise<CustomerServiceRecordCustomerProps> {
    const { data: customer } = await this.customerReadRepository.findById(
      input.customerId,
    );
    if (!customer || customer.status !== CustomerStatus.ACTIVE)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.CUSTOMER,
        { customerId: input.customerId },
      );
    const userIds = [...new Set(input.customerUserIds ?? [])];
    const users = await Promise.all(
      userIds.map((userId) => this.userReadRepository.findById(userId)),
    );
    const relationships = await Promise.all(
      userIds.map((userId) =>
        this.relationshipReadRepository.findByUserIdAndCustomerId(
          userId,
          customer.id,
        ),
      ),
    );
    if (
      users.some(({ data }) => !data) ||
      relationships.some(({ data }) => !data)
    )
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'customer_user_ids',
        reason: 'USER_NOT_RELATED_TO_CUSTOMER',
      });
    return {
      customerId: customer.id,
      customerName: customer.companyName,
      users: users.map(({ data }) => ({
        userId: data!.id,
        name: data!.fullName,
        email: data!.email,
      })),
    };
  }

  async prepareCustomerDelivery(
    input: CustomerServiceRecordCustomerDeliveryInputDto,
    current?: CustomerServiceRecordCustomerDeliveryProps,
  ): Promise<CustomerServiceRecordCustomerDeliveryProps> {
    const value = {
      ...current,
      ...input,
    } as CustomerServiceRecordCustomerDeliveryInputDto;
    const interval = this.normalizeInterval(value.estimatedDeliveryInterval);
    const receivedAt = this.normalizeDate(value.receivedAt, 'received_at');
    const estimatedDeliveryAt = this.resolveEstimatedDate(
      receivedAt,
      interval,
      value.estimatedDeliveryAt,
      'estimated_delivery_at',
    );
    await Promise.all([
      this.assertStatusPolicy(value.statusPolicyId),
      this.assertNotificationPolicy(value.notificationPolicyId),
    ]);
    return {
      receivedAt,
      estimatedDeliveryInterval: interval,
      estimatedDeliveryAt,
      deliveredToCustomerAt: this.normalizeDate(
        value.deliveredToCustomerAt,
        'delivered_to_customer_at',
      ),
      statusPolicyId: value.statusPolicyId ?? null,
      notificationPolicyId: value.notificationPolicyId ?? null,
      statusMaterialization: current?.statusMaterialization ?? null,
      notificationMaterialization: current?.notificationMaterialization ?? null,
    };
  }

  async prepareProvider(
    input: CustomerServiceRecordProviderInputDto | null,
    current?: CustomerServiceRecordProviderProps | null,
  ): Promise<CustomerServiceRecordProviderProps | null> {
    if (input === null) return null;
    const { data: provider } = await this.providerReadRepository.findById(
      input.providerId,
    );
    if (!provider || provider.status !== ProviderStatus.ACTIVE)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.PROVIDER,
        { providerId: input.providerId },
      );
    const interval = this.normalizeInterval(input.estimatedReturnInterval);
    const deliveredToProviderAt = this.normalizeDate(
      input.deliveredToProviderAt,
      'delivered_to_provider_at',
    );
    const estimatedReturnAt = this.resolveEstimatedDate(
      deliveredToProviderAt,
      interval,
      input.estimatedReturnAt,
      'estimated_return_at',
    );
    await Promise.all([
      this.assertStatusPolicy(input.statusPolicyId),
      this.assertNotificationPolicy(input.notificationPolicyId),
      this.assertRecipientGroups(input.followUp?.rules ?? []),
    ]);
    return {
      providerId: provider.id,
      providerName: provider.companyName,
      deliveredToProviderAt,
      estimatedReturnInterval: interval,
      estimatedReturnAt,
      returnedFromProviderAt: this.normalizeDate(
        input.returnedFromProviderAt,
        'returned_from_provider_at',
      ),
      statusPolicyId: input.statusPolicyId ?? null,
      notificationPolicyId: input.notificationPolicyId ?? null,
      followUp: {
        enabled: Boolean(input.followUp?.enabled),
        rules: (input.followUp?.rules ?? []).map((rule) => ({
          interval: this.normalizeInterval(rule.interval),
          recipientGroupIds: [...new Set(rule.recipientGroupIds ?? [])],
          ccRecipientGroupIds: [...new Set(rule.ccRecipientGroupIds ?? [])],
        })),
      },
      statusMaterialization: current?.statusMaterialization ?? null,
      notificationMaterialization: current?.notificationMaterialization ?? null,
      followUpMaterialization: current?.followUpMaterialization ?? [],
    };
  }

  normalizeDate(
    value: string | null | undefined,
    field: string,
  ): string | null {
    if (value == null || value === '') return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field,
        reason: 'INVALID_DATE_ONLY',
      });
    return value;
  }

  normalizeInterval(
    value?: Partial<CustomerServiceRecordIntervalProps> | null,
  ): CustomerServiceRecordIntervalProps {
    return {
      years: Math.max(0, Math.trunc(value?.years ?? 0)),
      months: Math.max(0, Math.trunc(value?.months ?? 0)),
      weeks: Math.max(0, Math.trunc(value?.weeks ?? 0)),
      days: Math.max(0, Math.trunc(value?.days ?? 0)),
    };
  }

  private resolveEstimatedDate(
    baseDate: string | null,
    interval: CustomerServiceRecordIntervalProps,
    explicitDate: string | null,
    field: string,
  ): string | null {
    const normalized = this.normalizeDate(explicitDate, field);
    return (
      normalized ??
      (baseDate
        ? addCustomerServiceRecordInterval({ date: baseDate, interval })
        : null)
    );
  }
  private async assertStatusPolicy(
    id: string | null | undefined,
  ): Promise<void> {
    if (!id) return;
    const { data } = await this.statusPolicyReadRepository.findById(id);
    if (!data || data.status !== ExpirationStatusPolicyStatus.ACTIVE)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_STATUS_POLICY,
        { id },
      );
  }
  private async assertNotificationPolicy(
    id: string | null | undefined,
  ): Promise<void> {
    if (!id) return;
    const { data } = await this.notificationPolicyReadRepository.findById(id);
    if (!data || data.status !== ExpirationNotificationPolicyStatus.ACTIVE)
      throw EntityNotFoundException.create(
        EntityNotFoundExceptionCode.EXPIRATION_NOTIFICATION_POLICY,
        { id },
      );
  }
  private async assertRecipientGroups(
    rules: Array<{
      recipientGroupIds: string[];
      ccRecipientGroupIds: string[];
    }>,
  ): Promise<void> {
    const ids = [
      ...new Set(
        rules.flatMap((rule) => [
          ...rule.recipientGroupIds,
          ...rule.ccRecipientGroupIds,
        ]),
      ),
    ];
    if (!ids.length) return;
    const { data } = await this.recipientGroupReadRepository.findByIds(ids);
    if (
      data.length !== ids.length ||
      data.some((group) => group.status !== RecipientGroupStatus.ACTIVE)
    )
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'provider.follow_up.rules',
        reason: 'INVALID_RECIPIENT_GROUP',
      });
  }
}
