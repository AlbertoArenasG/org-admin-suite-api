import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export enum InternalAssetMaintenanceType {
  CALIBRATION = 'CALIBRATION',
  VERIFICATION = 'VERIFICATION',
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
  PROVIDER_PAYMENT = 'PROVIDER_PAYMENT',
  QUOTATION_DELIVERY = 'QUOTATION_DELIVERY',
}

export enum InternalAssetMaintenanceRecordStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED',
}

export enum InternalAssetExpirationStatusMaterializationSource {
  SYSTEM = 'SYSTEM',
  POLICY = 'POLICY',
}

export enum InternalAssetNotificationTriggerEventStatus {
  PENDING = 'PENDING',
  TRIGGERED = 'TRIGGERED',
  FAILED = 'FAILED',
  INVALIDATED = 'INVALIDATED',
}

export interface InternalAssetMaintenanceIntervalProps {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface InternalAssetMaintenanceProviderProps {
  sentToProvider: boolean;
  providerName: string | null;
  sentToProviderAt: string | null;
  providerLeadTime: InternalAssetMaintenanceIntervalProps | null;
  providerNotes: string | null;
}

export interface InternalAssetMaintenanceProviderFollowUpRuleProps {
  offset: InternalAssetMaintenanceIntervalProps;
  recipientGroupIds: string[];
  ccRecipientGroupIds: string[];
}

export interface InternalAssetMaintenanceProviderFollowUpProps {
  enabled: boolean;
  rules: InternalAssetMaintenanceProviderFollowUpRuleProps[];
  lastSentAt: Date | null;
}

export interface InternalAssetExpirationStatusMaterializationMatchedRuleProps {
  sourceRuleId: string;
  startOffset: InternalAssetMaintenanceIntervalProps;
}

export interface InternalAssetExpirationStatusMaterializationProps {
  source: InternalAssetExpirationStatusMaterializationSource;
  code: string;
  effectiveStartDate: string | null;
  label: string;
  labelKey: string | null;
  colorHex: string;
  matchedRule: InternalAssetExpirationStatusMaterializationMatchedRuleProps | null;
  lastMaterializedAt: Date;
}

export interface InternalAssetNotificationTriggerEventProps {
  triggerDate: string;
  status: InternalAssetNotificationTriggerEventStatus;
  triggeredAt: Date | null;
  failureReason: string | null;
}

export interface InternalAssetNotificationMaterializedRuleProps {
  sourceRuleId: string;
  anchor: string;
  startOffset: InternalAssetMaintenanceIntervalProps;
  triggerMode: string;
  repeatEvery: InternalAssetMaintenanceIntervalProps | null;
  repeatUntil: string | null;
  repeatFor: InternalAssetMaintenanceIntervalProps | null;
  triggerEvents: InternalAssetNotificationTriggerEventProps[];
  lastTriggeredAt: Date | null;
}

export interface InternalAssetExpirationNotificationMaterializationProps {
  source: InternalAssetExpirationStatusMaterializationSource;
  nextTriggerDate: string | null;
  lastTriggeredAt: Date | null;
  materializedRulesCount: number;
  materializedRules: InternalAssetNotificationMaterializedRuleProps[];
  lastMaterializedAt: Date;
}

export interface InternalAssetMaintenanceRecordProps {
  id?: string;
  assetName: string;
  assetIdentifier: string;
  assetMaintenanceType: InternalAssetMaintenanceType;
  lastMaintenanceAt: string;
  interval: InternalAssetMaintenanceIntervalProps;
  expirationDate: string;
  observations: string | null;
  status?: InternalAssetMaintenanceRecordStatus;
  expirationStatusPolicyId?: string | null;
  expirationNotificationPolicyId?: string | null;
  provider?: InternalAssetMaintenanceProviderProps | null;
  providerFollowUp?: InternalAssetMaintenanceProviderFollowUpProps | null;
  expirationStatusMaterialization?: InternalAssetExpirationStatusMaterializationProps | null;
  expirationNotificationMaterialization?: InternalAssetExpirationNotificationMaterializationProps | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InternalAssetMaintenanceRecord extends Entity<InternalAssetMaintenanceRecordProps> {
  constructor(props: InternalAssetMaintenanceRecordProps) {
    props.id = props.id ?? genId();
    props.observations = props.observations ?? null;
    props.status = props.status ?? InternalAssetMaintenanceRecordStatus.PENDING;
    props.expirationStatusPolicyId = props.expirationStatusPolicyId ?? null;
    props.expirationNotificationPolicyId =
      props.expirationNotificationPolicyId ?? null;
    props.provider = InternalAssetMaintenanceRecord.normalizeProvider(
      props.provider ?? null,
    );
    props.providerFollowUp =
      InternalAssetMaintenanceRecord.normalizeProviderFollowUp(
        props.providerFollowUp ?? null,
      );
    props.expirationStatusMaterialization =
      InternalAssetMaintenanceRecord.normalizeExpirationStatusMaterialization(
        props.expirationStatusMaterialization ?? null,
      );
    props.expirationNotificationMaterialization =
      InternalAssetMaintenanceRecord.normalizeExpirationNotificationMaterialization(
        props.expirationNotificationMaterialization ?? null,
      );
    props.interval = InternalAssetMaintenanceRecord.normalizeInterval(
      props.interval,
    );
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;

    super(props);
  }

  get id(): string {
    return this.props.id!;
  }

  get assetName(): string {
    return this.props.assetName;
  }

  get assetIdentifier(): string {
    return this.props.assetIdentifier;
  }

  get assetMaintenanceType(): InternalAssetMaintenanceType {
    return this.props.assetMaintenanceType;
  }

  get lastMaintenanceAt(): string {
    return this.props.lastMaintenanceAt;
  }

  get interval(): InternalAssetMaintenanceIntervalProps {
    return { ...this.props.interval };
  }

  get expirationDate(): string {
    return this.props.expirationDate;
  }

  get observations(): string | null {
    return this.props.observations ?? null;
  }

  get status(): InternalAssetMaintenanceRecordStatus {
    return this.props.status ?? InternalAssetMaintenanceRecordStatus.PENDING;
  }

  get expirationStatusPolicyId(): string | null {
    return this.props.expirationStatusPolicyId ?? null;
  }

  get expirationNotificationPolicyId(): string | null {
    return this.props.expirationNotificationPolicyId ?? null;
  }

  get provider(): InternalAssetMaintenanceProviderProps | null {
    return this.props.provider ? { ...this.props.provider } : null;
  }

  get providerFollowUp(): InternalAssetMaintenanceProviderFollowUpProps | null {
    return this.props.providerFollowUp
      ? {
          ...this.props.providerFollowUp,
          rules: this.props.providerFollowUp.rules.map((rule) => ({
            ...rule,
            offset: { ...rule.offset },
            recipientGroupIds: [...rule.recipientGroupIds],
            ccRecipientGroupIds: [...rule.ccRecipientGroupIds],
          })),
        }
      : null;
  }

  get expirationStatusMaterialization(): InternalAssetExpirationStatusMaterializationProps | null {
    return this.props.expirationStatusMaterialization
      ? {
          ...this.props.expirationStatusMaterialization,
          matchedRule: this.props.expirationStatusMaterialization.matchedRule
            ? {
                ...this.props.expirationStatusMaterialization.matchedRule,
                startOffset: {
                  ...this.props.expirationStatusMaterialization.matchedRule
                    .startOffset,
                },
              }
            : null,
        }
      : null;
  }

  get expirationNotificationMaterialization(): InternalAssetExpirationNotificationMaterializationProps | null {
    return this.props.expirationNotificationMaterialization
      ? {
          ...this.props.expirationNotificationMaterialization,
          materializedRules:
            this.props.expirationNotificationMaterialization.materializedRules.map(
              (rule) => ({
                ...rule,
                startOffset: { ...rule.startOffset },
                repeatEvery: rule.repeatEvery ? { ...rule.repeatEvery } : null,
                repeatFor: rule.repeatFor ? { ...rule.repeatFor } : null,
                triggerEvents: rule.triggerEvents.map((event) => ({
                  ...event,
                })),
              }),
            ),
        }
      : null;
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

  get currentState(): InternalAssetMaintenanceRecordProps {
    return this.props;
  }

  updateDetails(
    details: {
      assetName?: string;
      assetIdentifier?: string;
      assetMaintenanceType?: InternalAssetMaintenanceType;
      lastMaintenanceAt?: string;
      interval?: InternalAssetMaintenanceIntervalProps;
      expirationDate?: string;
      observations?: string | null;
      status?: InternalAssetMaintenanceRecordStatus;
      expirationStatusPolicyId?: string | null;
      expirationNotificationPolicyId?: string | null;
      provider?: InternalAssetMaintenanceProviderProps | null;
      providerFollowUp?: InternalAssetMaintenanceProviderFollowUpProps | null;
      expirationStatusMaterialization?: InternalAssetExpirationStatusMaterializationProps | null;
      expirationNotificationMaterialization?: InternalAssetExpirationNotificationMaterializationProps | null;
    },
    updatedBy?: string | null,
  ): void {
    if (details.assetName !== undefined) {
      this.props.assetName = details.assetName;
    }

    if (details.assetIdentifier !== undefined) {
      this.props.assetIdentifier = details.assetIdentifier;
    }

    if (details.assetMaintenanceType !== undefined) {
      this.props.assetMaintenanceType = details.assetMaintenanceType;
    }

    if (details.lastMaintenanceAt !== undefined) {
      this.props.lastMaintenanceAt = details.lastMaintenanceAt;
    }

    if (details.interval !== undefined) {
      this.props.interval = InternalAssetMaintenanceRecord.normalizeInterval(
        details.interval,
      );
    }

    if (details.expirationDate !== undefined) {
      this.props.expirationDate = details.expirationDate;
    }

    if (details.observations !== undefined) {
      this.props.observations = details.observations;
    }

    if (details.status !== undefined) {
      this.props.status = details.status;
    }

    if (details.expirationStatusPolicyId !== undefined) {
      this.props.expirationStatusPolicyId = details.expirationStatusPolicyId;
    }

    if (details.expirationNotificationPolicyId !== undefined) {
      this.props.expirationNotificationPolicyId =
        details.expirationNotificationPolicyId;
    }

    if (details.provider !== undefined) {
      this.props.provider = InternalAssetMaintenanceRecord.normalizeProvider(
        details.provider,
      );
    }

    if (details.providerFollowUp !== undefined) {
      this.props.providerFollowUp =
        InternalAssetMaintenanceRecord.normalizeProviderFollowUp(
          details.providerFollowUp,
        );
    }

    if (details.expirationStatusMaterialization !== undefined) {
      this.props.expirationStatusMaterialization =
        InternalAssetMaintenanceRecord.normalizeExpirationStatusMaterialization(
          details.expirationStatusMaterialization,
        );
    }

    if (details.expirationNotificationMaterialization !== undefined) {
      this.props.expirationNotificationMaterialization =
        InternalAssetMaintenanceRecord.normalizeExpirationNotificationMaterialization(
          details.expirationNotificationMaterialization,
        );
    }

    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = InternalAssetMaintenanceRecordStatus.DELETED;
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) {
      this.props.updatedBy = updatedBy;
    }

    this.props.updatedAt = new Date();
  }

  private static normalizeInterval(
    interval: InternalAssetMaintenanceIntervalProps,
  ): InternalAssetMaintenanceIntervalProps {
    return {
      years: Math.max(0, Math.trunc(interval.years ?? 0)),
      months: Math.max(0, Math.trunc(interval.months ?? 0)),
      weeks: Math.max(0, Math.trunc(interval.weeks ?? 0)),
      days: Math.max(0, Math.trunc(interval.days ?? 0)),
    };
  }

  private static normalizeProvider(
    provider: InternalAssetMaintenanceProviderProps | null,
  ): InternalAssetMaintenanceProviderProps | null {
    if (!provider) {
      return null;
    }

    return {
      sentToProvider: Boolean(provider.sentToProvider),
      providerName: provider.providerName ?? null,
      sentToProviderAt: provider.sentToProviderAt ?? null,
      providerLeadTime: provider.providerLeadTime
        ? InternalAssetMaintenanceRecord.normalizeInterval(
            provider.providerLeadTime,
          )
        : null,
      providerNotes: provider.providerNotes ?? null,
    };
  }

  private static normalizeProviderFollowUp(
    providerFollowUp: InternalAssetMaintenanceProviderFollowUpProps | null,
  ): InternalAssetMaintenanceProviderFollowUpProps | null {
    if (!providerFollowUp) {
      return null;
    }

    return {
      enabled: Boolean(providerFollowUp.enabled),
      rules: providerFollowUp.rules.map((rule) => ({
        offset: InternalAssetMaintenanceRecord.normalizeInterval(rule.offset),
        recipientGroupIds: rule.recipientGroupIds
          .map((value) => value.trim())
          .filter(Boolean),
        ccRecipientGroupIds: rule.ccRecipientGroupIds
          .map((value) => value.trim())
          .filter(Boolean),
      })),
      lastSentAt: providerFollowUp.lastSentAt ?? null,
    };
  }

  private static normalizeExpirationStatusMaterialization(
    materialization: InternalAssetExpirationStatusMaterializationProps | null,
  ): InternalAssetExpirationStatusMaterializationProps | null {
    if (!materialization) {
      return null;
    }

    return {
      source: materialization.source,
      code: materialization.code,
      effectiveStartDate: materialization.effectiveStartDate ?? null,
      label: materialization.label,
      labelKey: materialization.labelKey,
      colorHex: materialization.colorHex,
      matchedRule: materialization.matchedRule
        ? {
            sourceRuleId: materialization.matchedRule.sourceRuleId,
            startOffset: InternalAssetMaintenanceRecord.normalizeInterval(
              materialization.matchedRule.startOffset,
            ),
          }
        : null,
      lastMaterializedAt: materialization.lastMaterializedAt,
    };
  }

  private static normalizeExpirationNotificationMaterialization(
    materialization: InternalAssetExpirationNotificationMaterializationProps | null,
  ): InternalAssetExpirationNotificationMaterializationProps | null {
    if (!materialization) {
      return null;
    }

    return {
      source: materialization.source,
      nextTriggerDate: materialization.nextTriggerDate ?? null,
      lastTriggeredAt: materialization.lastTriggeredAt ?? null,
      materializedRulesCount: Math.max(
        0,
        Math.trunc(materialization.materializedRulesCount ?? 0),
      ),
      materializedRules: materialization.materializedRules.map((rule) => ({
        sourceRuleId: rule.sourceRuleId,
        anchor: rule.anchor,
        startOffset: InternalAssetMaintenanceRecord.normalizeInterval(
          rule.startOffset,
        ),
        triggerMode: rule.triggerMode,
        repeatEvery: rule.repeatEvery
          ? InternalAssetMaintenanceRecord.normalizeInterval(rule.repeatEvery)
          : null,
        repeatUntil: rule.repeatUntil ?? null,
        repeatFor: rule.repeatFor
          ? InternalAssetMaintenanceRecord.normalizeInterval(rule.repeatFor)
          : null,
        triggerEvents: [...rule.triggerEvents]
          .map((event) => ({
            triggerDate: event.triggerDate,
            status: event.status,
            triggeredAt: event.triggeredAt ?? null,
            failureReason: event.failureReason ?? null,
          }))
          .sort((a, b) => a.triggerDate.localeCompare(b.triggerDate)),
        lastTriggeredAt: rule.lastTriggeredAt ?? null,
      })),
      lastMaterializedAt: materialization.lastMaterializedAt,
    };
  }
}
