import { Injectable } from '@nestjs/common';

import { Contact } from '@domain/entities';
import { IContactWriteRepository } from '@domain/ports/repositories';
import { MongooseContactBaseRepository } from './mongoose-contact-base.repository';

@Injectable()
export class MongooseContactWriteRepositoryImpl
  extends MongooseContactBaseRepository
  implements IContactWriteRepository
{
  async create(contact: Contact): Promise<{ data: Contact | null }> {
    const data = this.toMongoose(contact);
    const entity = new this.contactModel({
      contact_id: contact.id,
      ...data,
    });
    await entity.save({ session: this.transactionContext.getSession() });

    return {
      data: this.toDomain(entity),
    };
  }

  async update(contact: Contact): Promise<{ data: Contact | null }> {
    const data = this.toMongoose(contact);

    const updated = await this.contactModel
      .findOneAndUpdate({ contact_id: contact.id }, data, { new: true })
      .session(this.transactionContext.getSession() ?? null)
      .exec();

    return {
      data: this.toDomain(updated),
    };
  }

  async replaceCompanyNamesForUsers(
    updates: Array<{ userId: string; companyNames: string[] }>,
  ): Promise<void> {
    if (updates.length === 0) {
      return;
    }

    await this.contactModel.bulkWrite(
      updates.map((update) => ({
        updateOne: {
          filter: { user_id: update.userId },
          update: { $set: { company_names: update.companyNames } },
        },
      })),
      { session: this.transactionContext.getSession() },
    );
  }
}
