import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import * as commands from '@infra/cqrs/commands';

const commandList = Object.values(commands);

@Global()
@Module({
  imports: [CqrsModule],
  providers: [...commandList],
})
export class GlobalCqrsModule {}
