export interface AcquireInternalJobLockParams {
  jobName: string;
  executionId: string;
  leaseDurationMs: number;
}

export interface IInternalJobLockRepository {
  acquire(
    params: AcquireInternalJobLockParams,
  ): Promise<{ acquired: boolean; lockedUntil?: Date }>;

  release(params: { jobName: string; executionId: string }): Promise<void>;
}

export const IInternalJobLockRepositoryToken = Symbol(
  'IInternalJobLockRepository',
);
