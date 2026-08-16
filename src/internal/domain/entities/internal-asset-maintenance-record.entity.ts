import { Entity } from '@src/internal/core/entities/entity';
import { genId } from '@src/common/utils';

export enum InternalAssetMaintenanceType {
  CALIBRATION = 'CALIBRATION',
  VERIFICATION = 'VERIFICATION',
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
}

export enum InternalAssetMaintenanceRecordStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED',
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
}
