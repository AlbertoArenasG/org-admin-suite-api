import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CqrsModule } from '@nestjs/cqrs';

import * as controllers from '@infra/api/controllers';
import * as presenters from '@infra/api/presenters';

const controllersList = Object.values(controllers);
const presentersList = Object.values(presenters);

@Global()
@Module({
  imports: [CqrsModule, TerminusModule],
  controllers: [...controllersList],
  providers: [...presentersList],
})
export class GlobalHttpModule {}
