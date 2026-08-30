import { genId } from '@src/common/utils';
import { Entity } from '@src/internal/core/entities/entity';

export enum CustomerServiceRecordStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum CustomerServiceRecordOperationalStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CustomerServiceRecordMaterializationSource {
  SYSTEM = 'SYSTEM',
  POLICY = 'POLICY',
}

export enum CustomerServiceRecordNotificationTriggerEventStatus {
  PENDING = 'PENDING',
  TRIGGERED = 'TRIGGERED',
  FAILED = 'FAILED',
  INVALIDATED = 'INVALIDATED',
}

export enum CustomerServiceRecordProviderFollowUpEventStatus {
  PENDING = 'PENDING',
  TRIGGERED = 'TRIGGERED',
  FAILED = 'FAILED',
  INVALIDATED = 'INVALIDATED',
}

export interface CustomerServiceRecordIntervalProps {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface CustomerServiceRecordCustomerUserProps {
  userId: string;
  name: string;
  email: string;
}

export interface CustomerServiceRecordCustomerProps {
  customerId: string;
  customerName: string;
  users: CustomerServiceRecordCustomerUserProps[];
}

export interface CustomerServiceRecordAssetProps {
  assetId?: string;
  name: string;
  identifier: string;
  brand: string;
  model: string;
  serialNumber: string;
  observations: string | null;
}

export interface CustomerServiceRecordStatusMaterializationProps {
  source: CustomerServiceRecordMaterializationSource;
  code: string;
  effectiveStartDate: string | null;
  label: string;
  labelKey: string | null;
  colorHex: string;
  matchedRule: {
    sourceRuleId: string;
    startOffset: CustomerServiceRecordIntervalProps;
  } | null;
  lastMaterializedAt: Date;
}

export interface CustomerServiceRecordNotificationTriggerEventProps {
  triggerDate: string;
  status: CustomerServiceRecordNotificationTriggerEventStatus;
  triggeredAt: Date | null;
  failureReason: string | null;
}

export interface CustomerServiceRecordNotificationMaterializedRuleProps {
  sourceRuleId: string;
  anchor: string;
  startOffset: CustomerServiceRecordIntervalProps;
  triggerMode: string;
  repeatEvery: CustomerServiceRecordIntervalProps | null;
  repeatUntil: string | null;
  repeatFor: CustomerServiceRecordIntervalProps | null;
  triggerEvents: CustomerServiceRecordNotificationTriggerEventProps[];
  lastTriggeredAt: Date | null;
}

export interface CustomerServiceRecordNotificationMaterializationProps {
  source: CustomerServiceRecordMaterializationSource;
  nextTriggerDate: string | null;
  lastTriggeredAt: Date | null;
  materializedRulesCount: number;
  materializedRules: CustomerServiceRecordNotificationMaterializedRuleProps[];
  lastMaterializedAt: Date;
}

export interface CustomerServiceRecordProviderFollowUpRuleProps {
  ruleId?: string;
  interval: CustomerServiceRecordIntervalProps;
  recipientGroupIds: string[];
  ccRecipientGroupIds: string[];
}

export interface CustomerServiceRecordProviderFollowUpProps {
  enabled: boolean;
  rules: CustomerServiceRecordProviderFollowUpRuleProps[];
}

export interface CustomerServiceRecordProviderFollowUpMaterializationProps {
  source: 'EMBEDDED_RULE';
  sourceRuleId: string;
  triggerDate: string;
  status: CustomerServiceRecordProviderFollowUpEventStatus;
  triggeredAt: Date | null;
  failureReason: string | null;
  lastMaterializedAt: Date;
}

export interface CustomerServiceRecordCustomerDeliveryProps {
  receivedAt: string | null;
  estimatedDeliveryInterval: CustomerServiceRecordIntervalProps;
  estimatedDeliveryAt: string | null;
  deliveredToCustomerAt: string | null;
  statusPolicyId: string | null;
  notificationPolicyId: string | null;
  statusMaterialization: CustomerServiceRecordStatusMaterializationProps | null;
  notificationMaterialization: CustomerServiceRecordNotificationMaterializationProps | null;
}

export interface CustomerServiceRecordProviderProps {
  providerId: string;
  providerName: string;
  deliveredToProviderAt: string | null;
  estimatedReturnInterval: CustomerServiceRecordIntervalProps;
  estimatedReturnAt: string | null;
  returnedFromProviderAt: string | null;
  statusPolicyId: string | null;
  notificationPolicyId: string | null;
  followUp: CustomerServiceRecordProviderFollowUpProps;
  statusMaterialization: CustomerServiceRecordStatusMaterializationProps | null;
  notificationMaterialization: CustomerServiceRecordNotificationMaterializationProps | null;
  followUpMaterialization: CustomerServiceRecordProviderFollowUpMaterializationProps[];
}

export interface CustomerServiceRecordProps {
  id?: string;
  serviceNumber: number;
  serviceTypeCode: string;
  serviceTypeName: string;
  requestedAt: string;
  observations: string | null;
  customer: CustomerServiceRecordCustomerProps;
  assets: CustomerServiceRecordAssetProps[];
  customerDelivery: CustomerServiceRecordCustomerDeliveryProps;
  provider?: CustomerServiceRecordProviderProps | null;
  status?: CustomerServiceRecordStatus;
  operationalStatus?: CustomerServiceRecordOperationalStatus;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CustomerServiceRecord extends Entity<CustomerServiceRecordProps> {
  constructor(props: CustomerServiceRecordProps) {
    props.id = props.id ?? genId();
    props.observations = props.observations ?? null;
    props.status = props.status ?? CustomerServiceRecordStatus.ACTIVE;
    props.operationalStatus =
      props.operationalStatus ?? CustomerServiceRecordOperationalStatus.PENDING;
    props.assets = CustomerServiceRecord.normalizeAssets(props.assets ?? []);
    props.customerDelivery = CustomerServiceRecord.normalizeCustomerDelivery(
      props.customerDelivery,
    );
    props.provider = CustomerServiceRecord.normalizeProvider(
      props.provider ?? null,
    );
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;
    super(props);
  }

  get id(): string {
    return this.props.id!;
  }
  get serviceNumber(): number {
    return this.props.serviceNumber;
  }
  get serviceTypeCode(): string {
    return this.props.serviceTypeCode;
  }
  get serviceTypeName(): string {
    return this.props.serviceTypeName;
  }
  get requestedAt(): string {
    return this.props.requestedAt;
  }
  get observations(): string | null {
    return this.props.observations ?? null;
  }
  get customer(): CustomerServiceRecordCustomerProps {
    return structuredClone(this.props.customer);
  }
  get assets(): CustomerServiceRecordAssetProps[] {
    return structuredClone(this.props.assets);
  }
  get customerDelivery(): CustomerServiceRecordCustomerDeliveryProps {
    return structuredClone(this.props.customerDelivery);
  }
  get provider(): CustomerServiceRecordProviderProps | null {
    return this.props.provider ? structuredClone(this.props.provider) : null;
  }
  get status(): CustomerServiceRecordStatus {
    return this.props.status ?? CustomerServiceRecordStatus.ACTIVE;
  }
  get operationalStatus(): CustomerServiceRecordOperationalStatus {
    return (
      this.props.operationalStatus ??
      CustomerServiceRecordOperationalStatus.PENDING
    );
  }
  get createdBy(): string | null {
    return this.props.createdBy ?? null;
  }
  get updatedBy(): string | null {
    return this.props.updatedBy ?? null;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
  get currentState(): CustomerServiceRecordProps {
    return this.props;
  }

  updateDetails(
    details: Partial<
      Omit<
        CustomerServiceRecordProps,
        'id' | 'serviceNumber' | 'createdBy' | 'createdAt'
      >
    >,
    updatedBy?: string | null,
  ): void {
    if (details.serviceTypeCode !== undefined)
      this.props.serviceTypeCode = details.serviceTypeCode;
    if (details.serviceTypeName !== undefined)
      this.props.serviceTypeName = details.serviceTypeName;
    if (details.requestedAt !== undefined)
      this.props.requestedAt = details.requestedAt;
    if (details.observations !== undefined)
      this.props.observations = details.observations;
    if (details.customer !== undefined) this.props.customer = details.customer;
    if (details.assets !== undefined)
      this.props.assets = CustomerServiceRecord.normalizeAssets(details.assets);
    if (details.customerDelivery !== undefined)
      this.props.customerDelivery =
        CustomerServiceRecord.normalizeCustomerDelivery(
          details.customerDelivery,
        );
    if (details.provider !== undefined)
      this.props.provider = CustomerServiceRecord.normalizeProvider(
        details.provider,
      );
    if (details.operationalStatus !== undefined)
      this.props.operationalStatus = details.operationalStatus;
    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = CustomerServiceRecordStatus.DELETED;
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) this.props.updatedBy = updatedBy;
    this.props.updatedAt = new Date();
  }

  private static normalizeInterval(
    value: CustomerServiceRecordIntervalProps,
  ): CustomerServiceRecordIntervalProps {
    return {
      years: Math.max(0, Math.trunc(value?.years ?? 0)),
      months: Math.max(0, Math.trunc(value?.months ?? 0)),
      weeks: Math.max(0, Math.trunc(value?.weeks ?? 0)),
      days: Math.max(0, Math.trunc(value?.days ?? 0)),
    };
  }

  private static normalizeAssets(
    assets: CustomerServiceRecordAssetProps[],
  ): CustomerServiceRecordAssetProps[] {
    const identifiers = new Set<string>();
    return assets.map((asset) => {
      const identifier = asset.identifier.trim();
      if (identifiers.has(identifier))
        throw new Error('Duplicated asset identifier');
      identifiers.add(identifier);
      return {
        ...asset,
        assetId: asset.assetId ?? genId(),
        identifier,
        observations: asset.observations ?? null,
      };
    });
  }

  private static normalizeCustomerDelivery(
    value: CustomerServiceRecordCustomerDeliveryProps,
  ): CustomerServiceRecordCustomerDeliveryProps {
    return {
      ...value,
      estimatedDeliveryInterval: CustomerServiceRecord.normalizeInterval(
        value.estimatedDeliveryInterval,
      ),
      statusPolicyId: value.statusPolicyId ?? null,
      notificationPolicyId: value.notificationPolicyId ?? null,
      statusMaterialization: value.statusMaterialization ?? null,
      notificationMaterialization: value.notificationMaterialization ?? null,
    };
  }

  private static normalizeProvider(
    value: CustomerServiceRecordProviderProps | null,
  ): CustomerServiceRecordProviderProps | null {
    if (!value) return null;
    return {
      ...value,
      estimatedReturnInterval: CustomerServiceRecord.normalizeInterval(
        value.estimatedReturnInterval,
      ),
      statusPolicyId: value.statusPolicyId ?? null,
      notificationPolicyId: value.notificationPolicyId ?? null,
      followUp: {
        enabled: Boolean(value.followUp?.enabled),
        rules: (value.followUp?.rules ?? []).map((rule) => ({
          ...rule,
          ruleId: rule.ruleId ?? genId(),
          interval: CustomerServiceRecord.normalizeInterval(rule.interval),
          recipientGroupIds: [
            ...new Set(
              (rule.recipientGroupIds ?? [])
                .map((id) => id.trim())
                .filter(Boolean),
            ),
          ],
          ccRecipientGroupIds: [
            ...new Set(
              (rule.ccRecipientGroupIds ?? [])
                .map((id) => id.trim())
                .filter(Boolean),
            ),
          ],
        })),
      },
      statusMaterialization: value.statusMaterialization ?? null,
      notificationMaterialization: value.notificationMaterialization ?? null,
      followUpMaterialization: value.followUpMaterialization ?? [],
    };
  }
}
