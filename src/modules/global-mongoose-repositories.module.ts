import { Module, Global } from '@nestjs/common';

import {
  MongooseRepositoryTokens,
  MongooseRepositoriesConfig,
} from '@infra/persistence/mongoose/repositories/mongoose-repositories.config';

@Global()
@Module({
  providers: MongooseRepositoriesConfig,
  exports: MongooseRepositoryTokens,
})
export class GlobalMongooseRepositoriesModule {}
