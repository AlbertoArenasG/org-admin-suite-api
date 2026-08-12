import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Contact } from '@domain/entities';
import { ContactDocument } from '@infra/persistence/mongoose/schemas/contact/contact.schema';
import { MongooseContactMapper } from '@infra/persistence/mongoose/mappers/contact';

@Injectable()
export class MongooseContactBaseRepository {
  constructor(
    @InjectModel(ContactDocument.name)
    protected readonly contactModel: Model<ContactDocument>,
  ) {}

  protected toDomain(document: ContactDocument | null): Contact | null {
    return MongooseContactMapper.toDomain(document);
  }

  protected toMongoose(contact: Contact) {
    return MongooseContactMapper.toMongoose(contact);
  }
}
