import { Inject, Injectable } from '@nestjs/common';
import { CustomerServiceRecordInvoicePolicy } from '@domain/policies';
import {
  InternalJobException,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IBillingCustomerServiceRecordReadRepository,
  IBillingCustomerServiceRecordReadRepositoryToken,
  ICustomerServiceRecordWriteRepository,
  ICustomerServiceRecordWriteRepositoryToken,
  IInternalJobLockRepository,
  IInternalJobLockRepositoryToken,
} from '@domain/ports/repositories';
import { genId } from '@src/common/utils';

const JOB_NAME = 'billing_customer_service_record_overdue_refresh';
const BATCH_SIZE = 100;
const LEASE_DURATION_MS = 5 * 60 * 1000;
interface Cursor {
  createdAt: Date;
  recordId: string;
}

@Injectable()
export class RefreshBillingCustomerServiceRecordOverdueUseCase {
  constructor(
    @Inject(IBillingCustomerServiceRecordReadRepositoryToken)
    private readonly records: IBillingCustomerServiceRecordReadRepository,
    @Inject(ICustomerServiceRecordWriteRepositoryToken)
    private readonly writer: ICustomerServiceRecordWriteRepository,
    @Inject(IInternalJobLockRepositoryToken)
    private readonly locks: IInternalJobLockRepository,
  ) {}

  async execute(input: { cursor: string | null }) {
    const startedAt = Date.now();
    const after = this.decode(input.cursor);
    const today = this.todayInMexicoCity();
    const executionId = genId();
    const lock = await this.locks.acquire({
      jobName: JOB_NAME,
      executionId,
      leaseDurationMs: LEASE_DURATION_MS,
    });
    if (!lock.acquired)
      throw InternalJobException.lockActive(lock.lockedUntil ?? new Date());
    try {
      const { data } = await this.records.findOverdueCandidates({
        today,
        after,
        limit: BATCH_SIZE,
      });
      let updatedRecords = 0;
      for (const record of data) {
        if (
          CustomerServiceRecordInvoicePolicy.isOverdue(record.billing, today) &&
          (await this.writer.markInvoiceOverdueIfCurrent(record, today))
        )
          updatedRecords++;
      }
      const last = data.at(-1);
      if (last && !last.createdAt)
        throw new Error(`Record ${last.id} is missing createdAt`);
      return {
        processedRecords: data.length,
        updatedRecords,
        nextCursor:
          data.length === BATCH_SIZE && last
            ? this.encode({ createdAt: last.createdAt!, recordId: last.id })
            : null,
        durationMs: Date.now() - startedAt,
      };
    } finally {
      await this.locks.release({ jobName: JOB_NAME, executionId });
    }
  }

  private todayInMexicoCity(): string {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const part = (type: string) =>
      parts.find((value) => value.type === type)!.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  private decode(value: string | null): Cursor | undefined {
    if (!value) return undefined;
    try {
      const payload = JSON.parse(
        Buffer.from(value, 'base64url').toString('utf8'),
      );
      const createdAt = new Date(payload.createdAt);
      if (
        Number.isNaN(createdAt.getTime()) ||
        typeof payload.recordId !== 'string' ||
        !payload.recordId
      )
        throw new Error();
      return { createdAt, recordId: payload.recordId };
    } catch {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'cursor',
      });
    }
  }
  private encode(value: Cursor): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: value.createdAt.toISOString(),
        recordId: value.recordId,
      }),
    ).toString('base64url');
  }
}
