import {
  InternalAssetMaintenanceRecordStatus,
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
  labelKey: string;
  colorHex: string;
  source: 'SYSTEM';
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
