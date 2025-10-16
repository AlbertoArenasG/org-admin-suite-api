import { Module, Global } from '@nestjs/common';

import * as useCases from '@application/use-cases';
import * as services from '@application/services';

const useCaseList = Object.values(useCases);
const serviceList = Object.values(services);

@Global()
@Module({
  providers: [...useCaseList, ...serviceList],
  exports: [...useCaseList, ...serviceList],
})
export class GlobalApplicationModule {}
