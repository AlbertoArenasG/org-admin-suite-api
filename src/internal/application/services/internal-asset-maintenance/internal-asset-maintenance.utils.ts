import {
  ExpirationNotificationPolicy,
  ExpirationNotificationPolicyAnchor,
  ExpirationNotificationPolicyRepeatUntil,
  ExpirationNotificationPolicyRuleProps,
  ExpirationNotificationPolicyTriggerMode,
  ExpirationStatusPolicy,
  InternalAssetExpirationNotificationMaterializationProps,
  InternalAssetExpirationStatusMaterializationProps,
  InternalAssetExpirationStatusMaterializationSource,
  InternalAssetMaintenanceRecordStatus,
  InternalAssetMaintenanceRecord,
  InternalAssetNotificationMaterializedRuleProps,
  InternalAssetNotificationTriggerEventStatus,
  InternalAssetMaintenanceType,
} from '@domain/entities';
import {
  INTERNAL_ASSET_MAINTENANCE_TYPES,
  InternalAssetMaintenanceTypeCode,
} from './internal-asset-maintenance-types.catalog';

export interface InternalAssetMaintenanceCatalogItem {
  code: string;
  nameKey: string;
}

export interface DerivedInternalAssetStatus {
  code: 'ON_TIME' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';
  labelKey: string | null;
  colorHex: string;
  source: 'SYSTEM' | 'POLICY';
  label?: string;
  effectiveStartDate?: string | null;
  matchedRule?: {
    sourceRuleId: string;
    startOffset: {
      years: number;
      months: number;
      weeks: number;
      days: number;
    };
  } | null;
}

export interface InternalAssetMaintenanceStatusCatalogItem {
  code: InternalAssetMaintenanceRecordStatus;
  nameKey: string;
}

export function getInternalAssetMaintenanceType(
  code: string,
): InternalAssetMaintenanceCatalogItem | null {
  const normalizedCode = normalizeInternalAssetMaintenanceTypeCode(
    code,
  ) as InternalAssetMaintenanceTypeCode;
  const item = INTERNAL_ASSET_MAINTENANCE_TYPES[normalizedCode];

  if (!item) {
    return null;
  }

  return {
    code: item.code,
    nameKey: item.nameKey,
  };
}

export function getInternalAssetMaintenanceTypes(): InternalAssetMaintenanceCatalogItem[] {
  return Object.values(INTERNAL_ASSET_MAINTENANCE_TYPES).map((item) => ({
    code: item.code,
    nameKey: item.nameKey,
  }));
}

export function getInternalAssetMaintenanceStatuses(): InternalAssetMaintenanceStatusCatalogItem[] {
  return Object.values(InternalAssetMaintenanceRecordStatus).map((status) => ({
    code: status,
    nameKey: `INTERNAL_ASSET_MAINTENANCE_RECORD.STATUS.${status}`,
  }));
}

export function normalizeInternalAssetMaintenanceTypeCode(
  code: string,
): string {
  return code.trim().replace(/\s+/g, '_').toUpperCase();
}

export function isValidInternalAssetMaintenanceType(
  code: string,
): code is InternalAssetMaintenanceType {
  return Boolean(getInternalAssetMaintenanceType(code));
}

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
}

export function formatDateOnlyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addOffsetToDateOnly(input: {
  date: string;
  offset: {
    years: number;
    months: number;
    weeks: number;
    days: number;
  };
}): string {
  const [year, month, day] = input.date.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCFullYear(date.getUTCFullYear() + input.offset.years);
  date.setUTCMonth(date.getUTCMonth() + input.offset.months);
  date.setUTCDate(
    date.getUTCDate() + input.offset.weeks * 7 + input.offset.days,
  );

  return formatDateOnlyFromDate(date);
}

export function subtractOffsetFromDateOnly(input: {
  date: string;
  offset: {
    years: number;
    months: number;
    weeks: number;
    days: number;
  };
}): string {
  const [year, month, day] = input.date.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCFullYear(date.getUTCFullYear() - input.offset.years);
  date.setUTCMonth(date.getUTCMonth() - input.offset.months);
  date.setUTCDate(
    date.getUTCDate() - (input.offset.weeks * 7 + input.offset.days),
  );

  return formatDateOnlyFromDate(date);
}

export function getTodayDateOnlyInMexicoCity(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

export function getDerivedInternalAssetStatus(input: {
  status: InternalAssetMaintenanceRecordStatus;
  expirationDate: string;
  today: string;
}): DerivedInternalAssetStatus {
  if (input.status === InternalAssetMaintenanceRecordStatus.COMPLETED) {
    return {
      code: 'COMPLETED',
      labelKey: 'INTERNAL_ASSET_MAINTENANCE_RECORD.DERIVED_STATUS.COMPLETED',
      colorHex: '#2563EB',
      source: 'SYSTEM',
    };
  }

  if (input.status === InternalAssetMaintenanceRecordStatus.CANCELLED) {
    return {
      code: 'CANCELLED',
      labelKey: 'INTERNAL_ASSET_MAINTENANCE_RECORD.DERIVED_STATUS.CANCELLED',
      colorHex: '#6B7280',
      source: 'SYSTEM',
    };
  }

  if (
    (input.status === InternalAssetMaintenanceRecordStatus.PENDING ||
      input.status === InternalAssetMaintenanceRecordStatus.IN_PROGRESS) &&
    input.expirationDate < input.today
  ) {
    return {
      code: 'OVERDUE',
      labelKey: 'INTERNAL_ASSET_MAINTENANCE_RECORD.DERIVED_STATUS.OVERDUE',
      colorHex: '#EF4444',
      source: 'SYSTEM',
    };
  }

  return {
    code: 'ON_TIME',
    labelKey: 'INTERNAL_ASSET_MAINTENANCE_RECORD.DERIVED_STATUS.ON_TIME',
    colorHex: '#22C55E',
    source: 'SYSTEM',
  };
}

export function materializeInternalAssetExpirationStatus(input: {
  record: InternalAssetMaintenanceRecord;
  policy: ExpirationStatusPolicy | null;
  now?: Date;
  today?: string;
}): InternalAssetExpirationStatusMaterializationProps | null {
  const today = input.today ?? getTodayDateOnlyInMexicoCity();
  const now = input.now ?? new Date();

  if (input.record.status === InternalAssetMaintenanceRecordStatus.DELETED) {
    return null;
  }

  const systemStatus = getDerivedInternalAssetStatus({
    status: input.record.status,
    expirationDate: input.record.expirationDate,
    today,
  });

  if (
    systemStatus.code === 'COMPLETED' ||
    systemStatus.code === 'CANCELLED' ||
    systemStatus.code === 'OVERDUE'
  ) {
    return toSystemStatusMaterialization(systemStatus, now);
  }

  if (
    !input.policy ||
    input.policy.rules.length === 0 ||
    !isRecordOperational(input.record.status)
  ) {
    return toSystemStatusMaterialization(systemStatus, now);
  }

  const applicableRules = input.policy.rules
    .map((rule) => ({
      rule,
      effectiveStartDate: subtractOffsetFromDateOnly({
        date: input.record.expirationDate,
        offset: rule.startOffset,
      }),
    }))
    .filter((item) => item.effectiveStartDate <= today)
    .sort((a, b) => compareOffsetsAsc(a.rule.startOffset, b.rule.startOffset));

  const matched = applicableRules[0];

  if (!matched) {
    return toSystemStatusMaterialization(systemStatus, now);
  }

  return {
    source: InternalAssetExpirationStatusMaterializationSource.POLICY,
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

export function materializeInternalAssetExpirationNotification(input: {
  record: InternalAssetMaintenanceRecord;
  policy: ExpirationNotificationPolicy | null;
  previous:
    | InternalAssetExpirationNotificationMaterializationProps
    | null
    | undefined;
  now?: Date;
}): InternalAssetExpirationNotificationMaterializationProps | null {
  const now = input.now ?? new Date();

  if (input.record.status === InternalAssetMaintenanceRecordStatus.DELETED) {
    return invalidateExistingNotificationMaterialization(
      input.previous ?? null,
      now,
    );
  }

  if (!input.policy || input.policy.rules.length === 0) {
    return {
      source: InternalAssetExpirationStatusMaterializationSource.SYSTEM,
      nextTriggerDate: null,
      lastTriggeredAt: input.previous?.lastTriggeredAt ?? null,
      materializedRulesCount: 0,
      materializedRules: [],
      lastMaterializedAt: now,
    };
  }

  if (!isRecordOperational(input.record.status)) {
    return invalidateExistingNotificationMaterialization(
      input.previous ?? null,
      now,
    );
  }

  const materializedRules = input.policy.rules.map((rule) =>
    materializeNotificationRule({
      rule,
      expirationDate: input.record.expirationDate,
      previousRule:
        input.previous?.materializedRules.find(
          (item) => item.sourceRuleId === rule.ruleId,
        ) ?? null,
    }),
  );

  const nextTriggerDate =
    materializedRules
      .flatMap((rule) => rule.triggerEvents)
      .filter(
        (event) =>
          event.status === InternalAssetNotificationTriggerEventStatus.PENDING,
      )
      .sort((a, b) => a.triggerDate.localeCompare(b.triggerDate))[0]
      ?.triggerDate ?? null;

  const lastTriggeredAt =
    materializedRules
      .map((rule) => rule.lastTriggeredAt)
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return {
    source: InternalAssetExpirationStatusMaterializationSource.POLICY,
    nextTriggerDate,
    lastTriggeredAt,
    materializedRulesCount: materializedRules.length,
    materializedRules,
    lastMaterializedAt: now,
  };
}

function materializeNotificationRule(input: {
  rule: ExpirationNotificationPolicyRuleProps;
  expirationDate: string;
  previousRule: InternalAssetNotificationMaterializedRuleProps | null;
}): InternalAssetNotificationMaterializedRuleProps {
  const generatedDates = generateTriggerDatesForRule(
    input.rule,
    input.expirationDate,
  );
  const previousEvents = input.previousRule?.triggerEvents ?? [];
  const nextEvents = generatedDates.map((triggerDate) => {
    const reusablePreviousEvent = previousEvents.find(
      (event) =>
        event.triggerDate === triggerDate &&
        event.status !==
          InternalAssetNotificationTriggerEventStatus.INVALIDATED,
    );

    if (reusablePreviousEvent) {
      return { ...reusablePreviousEvent };
    }

    return {
      triggerDate,
      status: InternalAssetNotificationTriggerEventStatus.PENDING,
      triggeredAt: null,
      failureReason: null,
    };
  });

  const historicalInvalidatedEvents = previousEvents.filter(
    (event) =>
      event.status === InternalAssetNotificationTriggerEventStatus.INVALIDATED,
  );

  const triggerEvents = [...historicalInvalidatedEvents, ...nextEvents].sort(
    (a, b) => a.triggerDate.localeCompare(b.triggerDate),
  );

  const lastTriggeredAt =
    triggerEvents
      .map((event) => event.triggeredAt)
      .filter((value): value is Date => Boolean(value))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  return {
    sourceRuleId: input.rule.ruleId!,
    anchor: input.rule.anchor,
    startOffset: { ...input.rule.startOffset },
    triggerMode: input.rule.triggerMode,
    repeatEvery: input.rule.repeatEvery ? { ...input.rule.repeatEvery } : null,
    repeatUntil: input.rule.repeatUntil ?? null,
    repeatFor: input.rule.repeatFor ? { ...input.rule.repeatFor } : null,
    triggerEvents,
    lastTriggeredAt,
  };
}

function generateTriggerDatesForRule(
  rule: ExpirationNotificationPolicyRuleProps,
  expirationDate: string,
): string[] {
  const startDate =
    rule.anchor === ExpirationNotificationPolicyAnchor.BEFORE_EXPIRATION
      ? subtractOffsetFromDateOnly({
          date: expirationDate,
          offset: rule.startOffset,
        })
      : addOffsetToDateOnly({
          date: expirationDate,
          offset: rule.startOffset,
        });

  if (rule.triggerMode === ExpirationNotificationPolicyTriggerMode.ONE_TIME) {
    return [startDate];
  }

  const repeatEvery = rule.repeatEvery ?? {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
  };
  const repeatUntil = rule.repeatUntil;
  const dates: string[] = [startDate];

  if (!repeatUntil) {
    return dates;
  }

  let cursor = startDate;

  while (dates.length < 10) {
    cursor = addOffsetToDateOnly({
      date: cursor,
      offset: repeatEvery,
    });

    if (
      repeatUntil === ExpirationNotificationPolicyRepeatUntil.EXPIRATION_DATE &&
      cursor > expirationDate
    ) {
      break;
    }

    if (
      repeatUntil === ExpirationNotificationPolicyRepeatUntil.FIXED_DURATION &&
      rule.repeatFor
    ) {
      const fixedEndDate = addOffsetToDateOnly({
        date: startDate,
        offset: rule.repeatFor,
      });

      if (cursor > fixedEndDate) {
        break;
      }
    }

    dates.push(cursor);

    if (
      repeatUntil === ExpirationNotificationPolicyRepeatUntil.STATUS_CHANGES &&
      dates.length >= 10
    ) {
      break;
    }
  }

  return dates;
}

function invalidateExistingNotificationMaterialization(
  previous: InternalAssetExpirationNotificationMaterializationProps | null,
  now: Date,
): InternalAssetExpirationNotificationMaterializationProps | null {
  if (!previous) {
    return null;
  }

  const materializedRules = previous.materializedRules.map((rule) => ({
    ...rule,
    triggerEvents: rule.triggerEvents.map((event) =>
      event.status === InternalAssetNotificationTriggerEventStatus.PENDING
        ? {
            ...event,
            status: InternalAssetNotificationTriggerEventStatus.INVALIDATED,
          }
        : { ...event },
    ),
  }));

  return {
    source: previous.source,
    nextTriggerDate: null,
    lastTriggeredAt: previous.lastTriggeredAt,
    materializedRulesCount: materializedRules.length,
    materializedRules,
    lastMaterializedAt: now,
  };
}

function toSystemStatusMaterialization(
  status: DerivedInternalAssetStatus,
  now: Date,
): InternalAssetExpirationStatusMaterializationProps {
  return {
    source: InternalAssetExpirationStatusMaterializationSource.SYSTEM,
    code: status.code,
    effectiveStartDate: status.effectiveStartDate ?? null,
    label: getSystemDerivedStatusLabel(status.code),
    labelKey: status.labelKey,
    colorHex: status.colorHex,
    matchedRule: status.matchedRule ?? null,
    lastMaterializedAt: now,
  };
}

function getSystemDerivedStatusLabel(
  code: DerivedInternalAssetStatus['code'],
): string {
  switch (code) {
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'OVERDUE':
      return 'Overdue';
    case 'ON_TIME':
    default:
      return 'On time';
  }
}

function compareOffsetsAsc(
  left: {
    years: number;
    months: number;
    weeks: number;
    days: number;
  },
  right: {
    years: number;
    months: number;
    weeks: number;
    days: number;
  },
): number {
  return toComparableOffset(left) - toComparableOffset(right);
}

function toComparableOffset(offset: {
  years: number;
  months: number;
  weeks: number;
  days: number;
}): number {
  return (
    offset.years * 365 + offset.months * 30 + offset.weeks * 7 + offset.days
  );
}

export function isRecordOperational(
  status: InternalAssetMaintenanceRecordStatus,
) {
  return (
    status === InternalAssetMaintenanceRecordStatus.PENDING ||
    status === InternalAssetMaintenanceRecordStatus.IN_PROGRESS
  );
}
