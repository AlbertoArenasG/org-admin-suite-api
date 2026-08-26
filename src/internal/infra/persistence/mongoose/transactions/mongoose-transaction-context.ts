import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ClientSession } from 'mongoose';

@Injectable()
export class MongooseTransactionContext {
  private readonly storage = new AsyncLocalStorage<ClientSession>();

  getSession(): ClientSession | undefined {
    return this.storage.getStore();
  }

  run<T>(session: ClientSession, work: () => Promise<T>): Promise<T> {
    return this.storage.run(session, work);
  }
}
