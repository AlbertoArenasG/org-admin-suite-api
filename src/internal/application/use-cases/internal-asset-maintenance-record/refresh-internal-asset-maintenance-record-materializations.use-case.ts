import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  RefreshInternalAssetMaintenanceRecordMaterializationsDto,
  RefreshInternalAssetMaintenanceRecordMaterializationsResultDto,
} from '@application/dto';
import {
  InternalAssetMaintenanceRecordMaterializationsRefreshError,
  InternalAssetMaintenanceRecordTechnicalMaterializationsRefresher,
} from '@application/services';
import { genId } from '@src/common/utils';
import {
  InternalJobException,
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IInternalAssetMaintenanceRecordReadRepository,
  IInternalAssetMaintenanceRecordReadRepositoryToken,
  IInternalJobLockRepository,
  IInternalJobLockRepositoryToken,
} from '@domain/ports/repositories';

const JOB_NAME = 'internal_asset_maintenance_record_materializations_refresh';
const BATCH_SIZE = 100;
const LEASE_DURATION_MS = 5 * 60 * 1000;

interface RefreshCursor {
  createdAt: Date;
  recordId: string;
}

@Injectable()
export class RefreshInternalAssetMaintenanceRecordMaterializationsUseCase {
  private readonly logger = new Logger(
    RefreshInternalAssetMaintenanceRecordMaterializationsUseCase.name,
  );

  constructor(
    @Inject(IInternalAssetMaintenanceRecordReadRepositoryToken)
    private readonly readRepository: IInternalAssetMaintenanceRecordReadRepository,
    @Inject(IInternalJobLockRepositoryToken)
    private readonly jobLockRepository: IInternalJobLockRepository,
    private readonly technicalMaterializationsRefresher: InternalAssetMaintenanceRecordTechnicalMaterializationsRefresher,
  ) {}

  async execute(
    input: RefreshInternalAssetMaintenanceRecordMaterializationsDto,
  ): Promise<RefreshInternalAssetMaintenanceRecordMaterializationsResultDto> {
    const startedAt = Date.now();
    const executionId = genId();
    const cursor = this.decodeCursor(input.cursor);
    let lockAcquired = false;

    this.logger.log({
      event: 'internal_job.start',
      jobName: JOB_NAME,
      executionId,
      hasCursor: Boolean(input.cursor),
    });

    try {
      const lock = await this.jobLockRepository.acquire({
        jobName: JOB_NAME,
        executionId,
        leaseDurationMs: LEASE_DURATION_MS,
      });

      if (!lock.acquired) {
        this.logger.warn({
          event: 'internal_job.lock_active',
          jobName: JOB_NAME,
          executionId,
        });
        throw InternalJobException.lockActive(lock.lockedUntil ?? new Date());
      }

      lockAcquired = true;
      const { data: records } = await this.readRepository.findOperational({
        after: cursor,
        limit: BATCH_SIZE,
      });

      await this.technicalMaterializationsRefresher.refresh({
        records,
        refreshExpirationStatus: true,
        refreshExpirationNotification: true,
      });

      const result = {
        processedRecords: records.length,
        materializations: {
          expirationStatus: { refreshedRecords: records.length },
          expirationNotification: { refreshedRecords: records.length },
        },
        durationMs: Date.now() - startedAt,
        nextCursor:
          records.length === BATCH_SIZE
            ? this.encodeCursor(this.toCursor(records.at(-1)!))
            : null,
      };

      this.logger.log({
        event: 'internal_job.complete',
        jobName: JOB_NAME,
        executionId,
        processedRecords: result.processedRecords,
        durationMs: result.durationMs,
        hasNextCursor: Boolean(result.nextCursor),
      });

      return result;
    } catch (error) {
      this.logger.error({
        event: 'internal_job.error',
        jobName: JOB_NAME,
        executionId,
        durationMs: Date.now() - startedAt,
        hasCursor: Boolean(input.cursor),
        recordId:
          error instanceof
          InternalAssetMaintenanceRecordMaterializationsRefreshError
            ? error.recordId
            : undefined,
        stage:
          error instanceof
          InternalAssetMaintenanceRecordMaterializationsRefreshError
            ? error.stage
            : undefined,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      if (lockAcquired) {
        await this.jobLockRepository.release({
          jobName: JOB_NAME,
          executionId,
        });
      }
    }
  }

  private decodeCursor(value: string | null): RefreshCursor | undefined {
    if (value === null) {
      return undefined;
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(value, 'base64url').toString('utf8'),
      ) as { createdAt?: unknown; recordId?: unknown };
      const createdAt =
        typeof decoded.createdAt === 'string'
          ? new Date(decoded.createdAt)
          : null;

      if (
        !createdAt ||
        Number.isNaN(createdAt.getTime()) ||
        typeof decoded.recordId !== 'string' ||
        !decoded.recordId.trim()
      ) {
        throw new Error('Invalid cursor shape');
      }

      return { createdAt, recordId: decoded.recordId };
    } catch {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'cursor',
      });
    }
  }

  private encodeCursor(cursor: RefreshCursor): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: cursor.createdAt.toISOString(),
        recordId: cursor.recordId,
      }),
    ).toString('base64url');
  }

  private toCursor(record: { createdAt?: Date; id: string }): RefreshCursor {
    if (!record.createdAt) {
      throw new Error(
        `Internal asset maintenance record ${record.id} is missing createdAt`,
      );
    }

    return { createdAt: record.createdAt, recordId: record.id };
  }
}
