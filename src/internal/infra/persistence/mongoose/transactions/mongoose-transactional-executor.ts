import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { ITransactionalExecutor } from '@domain/ports/services';
import { MongooseTransactionContext } from './mongoose-transaction-context';

@Injectable()
export class MongooseTransactionalExecutor implements ITransactionalExecutor {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly transactionContext: MongooseTransactionContext,
  ) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    if (this.transactionContext.getSession()) {
      return work();
    }

    const session = await this.connection.startSession();

    try {
      let result!: T;

      await session.withTransaction(async () => {
        result = await this.transactionContext.run(session, work);
      });

      return result;
    } finally {
      await session.endSession();
    }
  }
}
