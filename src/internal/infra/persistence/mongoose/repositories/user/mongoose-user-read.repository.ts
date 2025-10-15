import { Injectable } from '@nestjs/common';

import { User, UserStatus } from '@domain/entities/user.entity';
import { IUserReadRepository } from '@src/internal/domain/ports/repositories';
import { MongooseUserBaseRepository } from './mongoose-user-base.repository';

@Injectable()
export class MongooseUserReadRepositoryImpl
  extends MongooseUserBaseRepository
  implements IUserReadRepository
{
  async findByEmail(email: string): Promise<{ data: User | null }> {
    return {
      data: await this.userModel.findOne({ email, status: UserStatus.ACTIVE }),
    };
  }
}
