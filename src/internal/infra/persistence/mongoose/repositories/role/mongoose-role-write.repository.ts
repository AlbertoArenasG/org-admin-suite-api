import { Injectable } from '@nestjs/common';

import { Role } from '@domain/entities';
import { IRoleWriteRepository } from '@domain/ports/repositories';
import { MongooseRoleBaseRepository } from './mongoose-role-base.repository';

@Injectable()
export class MongooseRoleWriteRepositoryImpl
  extends MongooseRoleBaseRepository
  implements IRoleWriteRepository
{
  async create(role: Role): Promise<{ data: Role | null }> {
    const document = new this.roleModel(this.toMongoose(role));
    await document.save();

    return { data: this.toDomain(document) };
  }

  async update(role: Role): Promise<{ data: Role | null }> {
    const document = await this.roleModel
      .findOneAndUpdate({ role_id: role.id }, this.toMongoose(role), {
        new: true,
      })
      .exec();

    return { data: this.toDomain(document) };
  }
}
