import { Inject, Injectable } from '@nestjs/common';
import {
  RefreshCustomerServiceRecordMaterializationsDto,
  RefreshCustomerServiceRecordMaterializationsResultDto,
} from '@application/dto';
import { CustomerServiceRecordTechnicalMaterializationsRefresherService } from '@application/services';
import { genId } from '@src/common/utils';
import {
  InternalJobException,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  ICustomerServiceRecordReadRepository,
  ICustomerServiceRecordReadRepositoryToken,
  IInternalJobLockRepository,
  IInternalJobLockRepositoryToken,
} from '@domain/ports/repositories';
const JOB_NAME = 'customer_service_record_materializations_refresh';
const BATCH_SIZE = 100;
const LEASE_DURATION_MS = 5 * 60 * 1000;
interface Cursor {
  createdAt: Date;
  recordId: string;
}
@Injectable()
export class RefreshCustomerServiceRecordMaterializationsUseCase {
  constructor(
    @Inject(ICustomerServiceRecordReadRepositoryToken)
    private readonly readRepository: ICustomerServiceRecordReadRepository,
    @Inject(IInternalJobLockRepositoryToken)
    private readonly lockRepository: IInternalJobLockRepository,
    private readonly refresher: CustomerServiceRecordTechnicalMaterializationsRefresherService,
  ) {}
  async execute(
    input: RefreshCustomerServiceRecordMaterializationsDto,
  ): Promise<RefreshCustomerServiceRecordMaterializationsResultDto> {
    const startedAt = Date.now();
    const executionId = genId();
    const cursor = this.decodeCursor(input.cursor);
    let acquired = false;
    try {
      const lock = await this.lockRepository.acquire({
        jobName: JOB_NAME,
        executionId,
        leaseDurationMs: LEASE_DURATION_MS,
      });
      if (!lock.acquired)
        throw InternalJobException.lockActive(lock.lockedUntil ?? new Date());
      acquired = true;
      const { data } = await this.readRepository.findOperational({
        after: cursor,
        limit: BATCH_SIZE,
      });
      await this.refresher.refresh({
        records: data,
        customerDeliveryStatus: true,
        customerDeliveryNotification: true,
        providerStatus: true,
        providerNotification: true,
        providerFollowUp: true,
      });
      const count = data.length;
      return {
        processedRecords: count,
        materializations: {
          customerDeliveryStatus: { refreshedRecords: count },
          customerDeliveryNotification: { refreshedRecords: count },
          providerStatus: { refreshedRecords: count },
          providerNotification: { refreshedRecords: count },
          providerFollowUp: { refreshedRecords: count },
        },
        durationMs: Date.now() - startedAt,
        nextCursor:
          count === BATCH_SIZE
            ? this.encodeCursor(this.toCursor(data.at(-1)!))
            : null,
      };
    } finally {
      if (acquired)
        await this.lockRepository.release({ jobName: JOB_NAME, executionId });
    }
  }
  private decodeCursor(value: string | null): Cursor | undefined {
    if (!value) return undefined;
    try {
      const decoded = JSON.parse(
        Buffer.from(value, 'base64url').toString('utf8'),
      );
      const createdAt = new Date(decoded.createdAt);
      if (
        Number.isNaN(createdAt.getTime()) ||
        typeof decoded.recordId !== 'string' ||
        !decoded.recordId
      )
        throw new Error();
      return { createdAt, recordId: decoded.recordId };
    } catch {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'cursor',
      });
    }
  }
  private encodeCursor(value: Cursor) {
    return Buffer.from(
      JSON.stringify({
        createdAt: value.createdAt.toISOString(),
        recordId: value.recordId,
      }),
    ).toString('base64url');
  }
  private toCursor(record: { createdAt?: Date; id: string }): Cursor {
    if (!record.createdAt)
      throw new Error(
        `Customer service record ${record.id} is missing createdAt`,
      );
    return { createdAt: record.createdAt, recordId: record.id };
  }
}
