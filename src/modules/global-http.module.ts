import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CqrsModule } from '@nestjs/cqrs';

import * as controllers from '@infra/api/controllers';
import * as presenters from '@infra/api/presenters';
import * as guards from '@src/internal/infra/api/guards';

const controllersList = Object.values(controllers);
const guardsList = Object.values(guards);
const presentersList = Object.values(presenters);

@Global()
@Module({
  imports: [CqrsModule, TerminusModule],
  controllers: [...controllersList],
  providers: [...presentersList, ...guardsList],
})
export class GlobalHttpModule {}
