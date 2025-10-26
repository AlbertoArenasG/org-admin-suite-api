import { Injectable } from '@nestjs/common';

import { ServiceEntryAccess } from '@domain/entities';
import { IServiceEntryAccessWriteRepository } from '@domain/ports/repositories';
import { MongooseServiceEntryAccessBaseRepository } from './mongoose-service-entry-access-base.repository';

@Injectable()
export class MongooseServiceEntryAccessWriteRepositoryImpl
  extends MongooseServiceEntryAccessBaseRepository
  implements IServiceEntryAccessWriteRepository
{
  async create(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const data = this.toMongoose(access);
    const document = new this.accessModel(data);
    await document.save();

    return {
      data: this.toDomain(document),
    };
  }

  async update(
    access: ServiceEntryAccess,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const data = this.toMongoose(access);

    const document = await this.accessModel
      .findOneAndUpdate({ service_entry_access_id: access.id }, data, {
        new: true,
      })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }
}
