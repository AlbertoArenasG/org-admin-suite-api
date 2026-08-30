import { CustomerServiceRecordIntervalProps } from '@domain/entities';

export function addCustomerServiceRecordInterval(input: {
  date: string;
  interval: CustomerServiceRecordIntervalProps;
}): string {
  const [year, month, day] = input.date.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(date.getUTCFullYear() + input.interval.years);
  date.setUTCMonth(date.getUTCMonth() + input.interval.months);
  date.setUTCDate(
    date.getUTCDate() + input.interval.weeks * 7 + input.interval.days,
  );
  return formatDateOnly(date);
}

export function subtractCustomerServiceRecordInterval(input: {
  date: string;
  interval: CustomerServiceRecordIntervalProps;
}): string {
  const [year, month, day] = input.date.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(date.getUTCFullYear() - input.interval.years);
  date.setUTCMonth(date.getUTCMonth() - input.interval.months);
  date.setUTCDate(
    date.getUTCDate() - (input.interval.weeks * 7 + input.interval.days),
  );
  return formatDateOnly(date);
}

export function getCustomerServiceRecordToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function compareCustomerServiceRecordIntervals(
  left: CustomerServiceRecordIntervalProps,
  right: CustomerServiceRecordIntervalProps,
): number {
  return toDays(left) - toDays(right);
}

function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDays(interval: CustomerServiceRecordIntervalProps): number {
  return (
    interval.years * 365 +
    interval.months * 30 +
    interval.weeks * 7 +
    interval.days
  );
}
