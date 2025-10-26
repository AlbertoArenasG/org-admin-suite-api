import { Injectable } from '@nestjs/common';

import { IServiceEntryAccessReadRepository } from '@domain/ports/repositories';
import { ServiceEntryAccess } from '@domain/entities';
import { MongooseServiceEntryAccessBaseRepository } from './mongoose-service-entry-access-base.repository';

@Injectable()
export class MongooseServiceEntryAccessReadRepositoryImpl
  extends MongooseServiceEntryAccessBaseRepository
  implements IServiceEntryAccessReadRepository
{
  async findByTokenHash(
    tokenHash: string,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const document = await this.accessModel
      .findOne({ token_hash: tokenHash })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }

  async findByServiceEntryId(
    serviceEntryId: string,
  ): Promise<{ data: ServiceEntryAccess | null }> {
    const document = await this.accessModel
      .findOne({ service_entry_id: serviceEntryId })
      .exec();

    return {
      data: document ? this.toDomain(document) : null,
    };
  }
}
