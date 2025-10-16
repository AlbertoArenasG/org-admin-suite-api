import { Global, Module } from '@nestjs/common';

import * as controllers from '@infra/api/controllers';

@Global()
@Module({
  controllers: Object.values(controllers),
})
export class GlobalHttpModule {}
