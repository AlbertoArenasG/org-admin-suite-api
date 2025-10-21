import { Logger } from '@nestjs/common';
import { inspect } from 'util';

export abstract class BaseQueryHandler<Query, Result> {
  private readonly logger = new Logger(this.constructor.name);

  abstract execute(query: Query): Promise<Result>;

  protected async run(
    query: Query,
    action: () => Promise<Result>,
  ): Promise<Result> {
    const startedAt = Date.now();
    this.logStart(query);

    try {
      const result = await action();
      this.logSuccess(query, startedAt, result);
      return result;
    } catch (error) {
      this.logError(query, startedAt, error);
      throw error;
    }
  }

  protected logStart(query: Query): void {
    this.logger.debug({
      event: 'query.start',
      handler: this.constructor.name,
      query: this.safeSerialize(query),
      timestamp: new Date().toISOString(),
    });
  }

  protected logSuccess(query: Query, startedAt: number, result: Result): void {
    this.logger.debug({
      event: 'query.success',
      handler: this.constructor.name,
      durationMs: Date.now() - startedAt,
      query: this.safeSerialize(query),
      result: this.safeSerialize(result),
      timestamp: new Date().toISOString(),
    });
  }

  protected logError(query: Query, startedAt: number, error: unknown): void {
    this.logger.error({
      event: 'query.error',
      handler: this.constructor.name,
      durationMs: Date.now() - startedAt,
      query: this.safeSerialize(query),
      error: this.safeSerialize(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  private safeSerialize(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return inspect(value, { depth: 3 });
    }
  }
}
