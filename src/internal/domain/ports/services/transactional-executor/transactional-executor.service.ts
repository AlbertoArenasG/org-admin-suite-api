export interface ITransactionalExecutor {
  execute<T>(work: () => Promise<T>): Promise<T>;
}

export const ITransactionalExecutorToken = Symbol('ITransactionalExecutor');
