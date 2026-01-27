import { Injectable } from '@nestjs/common';

import { Provider } from '@domain/entities';
import { IProviderWriteRepository } from '@domain/ports/repositories';
import { MongooseProviderBaseRepository } from './mongoose-provider-base.repository';

@Injectable()
export class MongooseProviderWriteRepositoryImpl
  extends MongooseProviderBaseRepository
  implements IProviderWriteRepository
{
  async create(provider: Provider): Promise<{ data: Provider | null }> {
    const data = this.toMongoose(provider);
    const entity = new this.providerModel(data);
    await entity.save();
    return {
      data: this.toDomain(entity),
    };
  }

  async update(provider: Provider): Promise<{ data: Provider | null }> {
    const data = this.toMongoose(provider);

    const updated = await this.providerModel
      .findOneAndUpdate({ provider_id: provider.id }, data, { new: true })
      .exec();

    return {
      data: updated ? this.toDomain(updated) : null,
    };
  }
}
