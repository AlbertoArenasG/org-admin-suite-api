import {
  ExpirationNotificationPolicy,
  ExpirationNotificationPolicyStatus,
  ExpirationStatusPolicy,
  ExpirationStatusPolicyStatus,
  InternalAssetExpirationNotificationMaterializationProps,
  InternalAssetExpirationStatusMaterializationProps,
  InternalAssetMaintenanceIntervalProps,
  InternalAssetMaintenanceProviderProps,
  InternalAssetMaintenanceRecord,
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IExpirationNotificationPolicyReadRepository,
  IExpirationStatusPolicyReadRepository,
} from '@domain/ports/repositories';
import {
  addOffsetToDateOnly,
  isValidDateOnly,
  isValidInternalAssetMaintenanceType,
  materializeInternalAssetExpirationNotification,
  materializeInternalAssetExpirationStatus,
} from '@application/services/internal-asset-maintenance';

interface NormalizeBaseInput {
  assetName: string;
  assetIdentifier: string;
  assetMaintenanceType: InternalAssetMaintenanceType;
  lastMaintenanceAt: string;
  interval: InternalAssetMaintenanceIntervalProps;
  expirationDate: string | null;
  observations: string | null;
  status: InternalAssetMaintenanceRecordStatus;
  expirationStatusPolicyId: string | null;
  expirationNotificationPolicyId: string | null;
  provider: InternalAssetMaintenanceProviderProps | null;
}

export async function normalizeInternalAssetMaintenanceRecordInput(
  input: NormalizeBaseInput,
  policies: {
    expirationStatusPolicyReadRepository: IExpirationStatusPolicyReadRepository;
    expirationNotificationPolicyReadRepository: IExpirationNotificationPolicyReadRepository;
  },
): Promise<NormalizeBaseInput> {
  const assetName = normalizeRequiredString(input.assetName, 'asset_name');
  const assetIdentifier = normalizeRequiredString(
    input.assetIdentifier,
    'asset_identifier',
  );
  const assetMaintenanceType = normalizeAssetMaintenanceType(
    input.assetMaintenanceType,
  );
  const lastMaintenanceAt = normalizeDateOnly(
    input.lastMaintenanceAt,
    'last_maintenance_at',
  );
  const interval = normalizeInterval(input.interval, 'interval', true);
  const expirationDate = normalizeExpirationDate({
    expirationDate: input.expirationDate,
    lastMaintenanceAt,
    interval,
  });
  const observations = normalizeOptionalString(input.observations);
  const status = normalizeStatus(input.status);
  const provider = normalizeProvider(input.provider);
  const expirationStatusPolicyId = await normalizeExpirationStatusPolicyId(
    input.expirationStatusPolicyId,
    policies.expirationStatusPolicyReadRepository,
  );
  const expirationNotificationPolicyId =
    await normalizeExpirationNotificationPolicyId(
      input.expirationNotificationPolicyId,
      policies.expirationNotificationPolicyReadRepository,
    );

  return {
    assetName,
    assetIdentifier,
    assetMaintenanceType,
    lastMaintenanceAt,
    interval,
    expirationDate,
    observations,
    status,
    expirationStatusPolicyId,
    expirationNotificationPolicyId,
    provider,
  };
}

export function normalizeInternalAssetMaintenanceRecordFilters(input: {
  search: string | null;
  assetMaintenanceType: InternalAssetMaintenanceType | null;
  status: InternalAssetMaintenanceRecordStatus | null;
  expirationStatusPolicyId: string | null;
  expirationNotificationPolicyId: string | null;
  sentToProvider: boolean | null;
}) {
  return {
    search: normalizeOptionalString(input.search),
    assetMaintenanceType: input.assetMaintenanceType
      ? normalizeAssetMaintenanceType(input.assetMaintenanceType)
      : null,
    status: input.status ? normalizeStatus(input.status) : null,
    expirationStatusPolicyId: normalizeOptionalString(
      input.expirationStatusPolicyId,
    ),
    expirationNotificationPolicyId: normalizeOptionalString(
      input.expirationNotificationPolicyId,
    ),
    sentToProvider:
      typeof input.sentToProvider === 'boolean' ? input.sentToProvider : null,
  };
}

export function collectPolicyIds(records: InternalAssetMaintenanceRecord[]) {
  return {
    expirationStatusPolicyIds: Array.from(
      new Set(
        records
          .map((record) => record.expirationStatusPolicyId)
          .filter((value): value is string => Boolean(value)),
      ),
    ),
    expirationNotificationPolicyIds: Array.from(
      new Set(
        records
          .map((record) => record.expirationNotificationPolicyId)
          .filter((value): value is string => Boolean(value)),
      ),
    ),
  };
}

export interface InternalAssetMaintenanceRecordMaterializations {
  expirationStatusMaterialization: InternalAssetExpirationStatusMaterializationProps | null;
  expirationNotificationMaterialization: InternalAssetExpirationNotificationMaterializationProps | null;
}

export function buildInternalAssetMaintenanceRecordMaterializations(input: {
  record: InternalAssetMaintenanceRecord;
  expirationStatusPolicy: ExpirationStatusPolicy | null;
  expirationNotificationPolicy: ExpirationNotificationPolicy | null;
}): InternalAssetMaintenanceRecordMaterializations {
  return {
    expirationStatusMaterialization: materializeInternalAssetExpirationStatus({
      record: input.record,
      policy: input.expirationStatusPolicy,
    }),
    expirationNotificationMaterialization:
      materializeInternalAssetExpirationNotification({
        record: input.record,
        policy: input.expirationNotificationPolicy,
        previous: input.record.expirationNotificationMaterialization,
      }),
  };
}

export function applyInternalAssetMaintenanceRecordMaterializations(input: {
  record: InternalAssetMaintenanceRecord;
  expirationStatusPolicy: ExpirationStatusPolicy | null;
  expirationNotificationPolicy: ExpirationNotificationPolicy | null;
  actorUserId: string;
}): void {
  const materializations = buildInternalAssetMaintenanceRecordMaterializations({
    record: input.record,
    expirationStatusPolicy: input.expirationStatusPolicy,
    expirationNotificationPolicy: input.expirationNotificationPolicy,
  });

  input.record.updateDetails(
    {
      expirationStatusMaterialization:
        materializations.expirationStatusMaterialization,
      expirationNotificationMaterialization:
        materializations.expirationNotificationMaterialization,
    },
    input.actorUserId,
  );
}

function normalizeRequiredString(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field,
    });
  }

  return normalized;
}

function normalizeOptionalString(value?: string | null): string | null {
  const normalized = value?.trim() ?? '';

  return normalized.length > 0 ? normalized : null;
}

function normalizeAssetMaintenanceType(
  value: string,
): InternalAssetMaintenanceType {
  if (!isValidInternalAssetMaintenanceType(value)) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'asset_maintenance_type',
      value,
    });
  }

  return value;
}

function normalizeStatus(value: string): InternalAssetMaintenanceRecordStatus {
  if (
    !Object.values(InternalAssetMaintenanceRecordStatus).includes(
      value as never,
    )
  ) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'status',
      value,
    });
  }

  return value as InternalAssetMaintenanceRecordStatus;
}

function normalizeDateOnly(value: string, field: string): string {
  if (!isValidDateOnly(value)) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field,
      value,
      reason: 'INVALID_DATE_ONLY',
    });
  }

  return value;
}

function normalizeInterval(
  interval: InternalAssetMaintenanceIntervalProps,
  field: string,
  requireNonZero: boolean,
): InternalAssetMaintenanceIntervalProps {
  const normalized = {
    years: Math.max(0, Math.trunc(interval.years ?? 0)),
    months: Math.max(0, Math.trunc(interval.months ?? 0)),
    weeks: Math.max(0, Math.trunc(interval.weeks ?? 0)),
    days: Math.max(0, Math.trunc(interval.days ?? 0)),
  };

  const isZero =
    normalized.years === 0 &&
    normalized.months === 0 &&
    normalized.weeks === 0 &&
    normalized.days === 0;

  if (requireNonZero && isZero) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field,
      reason: 'INTERVAL_EMPTY',
    });
  }

  return normalized;
}

function normalizeExpirationDate(input: {
  expirationDate: string | null;
  lastMaintenanceAt: string;
  interval: InternalAssetMaintenanceIntervalProps;
}): string {
  if (input.expirationDate) {
    return normalizeDateOnly(input.expirationDate, 'expiration_date');
  }

  return addOffsetToDateOnly({
    date: input.lastMaintenanceAt,
    offset: input.interval,
  });
}

function normalizeProvider(
  provider: InternalAssetMaintenanceProviderProps | null,
): InternalAssetMaintenanceProviderProps | null {
  if (!provider) {
    return null;
  }

  const sentToProvider = Boolean(provider.sentToProvider);
  const providerName = normalizeOptionalString(provider.providerName);
  const sentToProviderAt = provider.sentToProviderAt
    ? normalizeDateOnly(
        provider.sentToProviderAt,
        'provider.sent_to_provider_at',
      )
    : null;
  const providerLeadTime = provider.providerLeadTime
    ? normalizeInterval(
        provider.providerLeadTime,
        'provider.provider_lead_time',
        false,
      )
    : null;
  const providerNotes = normalizeOptionalString(provider.providerNotes);

  if (sentToProvider && !providerName) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'provider.provider_name',
      reason: 'PROVIDER_NAME_REQUIRED',
    });
  }

  return {
    sentToProvider,
    providerName,
    sentToProviderAt,
    providerLeadTime,
    providerNotes,
  };
}

async function normalizeExpirationStatusPolicyId(
  policyId: string | null,
  repository: IExpirationStatusPolicyReadRepository,
): Promise<string | null> {
  const normalizedPolicyId = normalizeOptionalString(policyId);

  if (!normalizedPolicyId) {
    return null;
  }

  const { data: policy } = await repository.findById(normalizedPolicyId);

  if (!policy || policy.status !== ExpirationStatusPolicyStatus.ACTIVE) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'expiration_status_policy_id',
      value: normalizedPolicyId,
      reason: 'POLICY_NOT_ACTIVE',
    });
  }

  return normalizedPolicyId;
}

async function normalizeExpirationNotificationPolicyId(
  policyId: string | null,
  repository: IExpirationNotificationPolicyReadRepository,
): Promise<string | null> {
  const normalizedPolicyId = normalizeOptionalString(policyId);

  if (!normalizedPolicyId) {
    return null;
  }

  const { data: policy } = await repository.findById(normalizedPolicyId);

  if (!policy || policy.status !== ExpirationNotificationPolicyStatus.ACTIVE) {
    throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
      field: 'expiration_notification_policy_id',
      value: normalizedPolicyId,
      reason: 'POLICY_NOT_ACTIVE',
    });
  }

  return normalizedPolicyId;
}
