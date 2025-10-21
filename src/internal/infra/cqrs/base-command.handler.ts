import { Logger } from '@nestjs/common';
import { inspect } from 'util';

export abstract class BaseCommandHandler<Command, Result> {
  private readonly logger = new Logger(this.constructor.name);

  abstract execute(command: Command): Promise<Result>;

  protected async run(
    command: Command,
    action: () => Promise<Result>,
  ): Promise<Result> {
    // const startedAt = Date.now();
    this.logStart(command);

    try {
      const result = await action();
      // this.logSuccess(command, startedAt, result);
      return result;
    } catch (error) {
      // this.logError(command, startedAt, error);
      throw error;
    }
  }

  protected logStart(command: Command): void {
    this.logger.debug({
      event: 'command.start',
      handler: this.constructor.name,
      command: this.safeSerialize(command),
      timestamp: new Date().toISOString(),
    });
  }

  protected logSuccess(
    command: Command,
    startedAt: number,
    result: Result,
  ): void {
    this.logger.debug({
      event: 'command.success',
      handler: this.constructor.name,
      durationMs: Date.now() - startedAt,
      command: this.safeSerialize(command),
      result: this.safeSerialize(result),
      timestamp: new Date().toISOString(),
    });
  }

  protected logError(
    command: Command,
    startedAt: number,
    error: unknown,
  ): void {
    this.logger.error({
      event: 'command.error',
      handler: this.constructor.name,
      durationMs: Date.now() - startedAt,
      command: this.safeSerialize(command),
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
