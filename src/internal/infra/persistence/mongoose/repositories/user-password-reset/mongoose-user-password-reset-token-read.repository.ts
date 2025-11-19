import { Injectable } from '@nestjs/common';

import { IUserPasswordResetTokenReadRepository } from '@domain/ports/repositories';
import { MongooseUserPasswordResetTokenBaseRepository } from './mongoose-user-password-reset-token-base.repository';

@Injectable()
export class MongooseUserPasswordResetTokenReadRepositoryImpl
  extends MongooseUserPasswordResetTokenBaseRepository
  implements IUserPasswordResetTokenReadRepository
{
  async findByTokenHash(tokenHash: string) {
    const document = await this.tokenModel
      .findOne({ token_hash: tokenHash })
      .exec();

    return {
      data: this.toDomain(document),
    };
  }
}
