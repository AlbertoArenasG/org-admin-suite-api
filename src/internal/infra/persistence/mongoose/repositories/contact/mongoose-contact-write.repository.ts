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
    await entity.save();

    return {
      data: this.toDomain(entity),
    };
  }

  async update(contact: Contact): Promise<{ data: Contact | null }> {
    const data = this.toMongoose(contact);

    const updated = await this.contactModel
      .findOneAndUpdate({ contact_id: contact.id }, data, { new: true })
      .exec();

    return {
      data: this.toDomain(updated),
    };
  }
}
