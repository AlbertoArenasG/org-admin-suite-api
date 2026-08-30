import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ISequenceCounterRepository } from '@domain/ports/repositories';
import { SequenceCounterDocument } from '@infra/persistence/mongoose/schemas';
import { MongooseTransactionContext } from '@infra/persistence/mongoose/transactions';

@Injectable()
export class MongooseSequenceCounterRepositoryImpl
  implements ISequenceCounterRepository
{
  constructor(
    @InjectModel(SequenceCounterDocument.name)
    private readonly sequenceCounterModel: Model<SequenceCounterDocument>,
    private readonly transactionContext: MongooseTransactionContext,
  ) {}

  async nextValue(key: string): Promise<number> {
    const counter = await this.sequenceCounterModel
      .findOneAndUpdate(
        { key },
        { $inc: { current_value: 1 }, $setOnInsert: { key } },
        {
          new: true,
          upsert: true,
          session: this.transactionContext.getSession(),
        },
      )
      .exec();
    return counter.current_value;
  }
}
