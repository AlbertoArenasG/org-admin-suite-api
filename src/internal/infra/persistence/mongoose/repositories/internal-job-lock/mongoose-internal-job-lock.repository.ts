import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AcquireInternalJobLockParams,
  IInternalJobLockRepository,
} from '@domain/ports/repositories';
import { InternalJobLockDocument } from '@infra/persistence/mongoose/schemas';

@Injectable()
export class MongooseInternalJobLockRepositoryImpl
  implements IInternalJobLockRepository
{
  constructor(
    @InjectModel(InternalJobLockDocument.name)
    private readonly internalJobLockModel: Model<InternalJobLockDocument>,
  ) {}

  async acquire(
    params: AcquireInternalJobLockParams,
  ): Promise<{ acquired: boolean; lockedUntil?: Date }> {
    const lockedUntil = new Date(Date.now() + params.leaseDurationMs);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const now = new Date();

      try {
        const lock = await this.internalJobLockModel
          .findOneAndUpdate(
            {
              job_name: params.jobName,
              locked_until: { $lte: now },
            },
            {
              $set: {
                execution_id: params.executionId,
                locked_until: lockedUntil,
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            },
          )
          .exec();

        if (lock) {
          return { acquired: true, lockedUntil: lock.locked_until };
        }
      } catch (error) {
        if (!isDuplicateKeyError(error)) {
          throw error;
        }
      }

      const activeLock = await this.internalJobLockModel
        .findOne({
          job_name: params.jobName,
          locked_until: { $gt: new Date() },
        })
        .exec();

      if (activeLock) {
        return { acquired: false, lockedUntil: activeLock.locked_until };
      }
    }

    const activeLock = await this.internalJobLockModel
      .findOne({
        job_name: params.jobName,
        locked_until: { $gt: new Date() },
      })
      .exec();

    return {
      acquired: false,
      lockedUntil: activeLock?.locked_until,
    };
  }

  async release(params: {
    jobName: string;
    executionId: string;
  }): Promise<void> {
    await this.internalJobLockModel
      .deleteOne({
        job_name: params.jobName,
        execution_id: params.executionId,
      })
      .exec();
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}
