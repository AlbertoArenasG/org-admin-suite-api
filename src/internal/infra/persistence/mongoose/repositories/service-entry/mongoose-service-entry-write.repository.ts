import { Injectable } from '@nestjs/common';

import { ServiceEntry } from '@domain/entities';
import { IServiceEntryWriteRepository } from '@domain/ports/repositories';
import { MongooseServiceEntryBaseRepository } from './mongoose-service-entry-base.repository';

@Injectable()
export class MongooseServiceEntryWriteRepositoryImpl
  extends MongooseServiceEntryBaseRepository
  implements IServiceEntryWriteRepository
{
  async create(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }> {
    const data = this.toMongoose(entry);
    const document = new this.serviceEntryModel(data);
    await document.save();

    return {
      data: this.toDomain(document),
    };
  }

  async update(entry: ServiceEntry): Promise<{ data: ServiceEntry | null }> {
    const data = this.toMongoose(entry);

    const document = await this.serviceEntryModel
      .findOneAndUpdate({ service_entry_id: entry.id }, data, { new: true })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }
}
