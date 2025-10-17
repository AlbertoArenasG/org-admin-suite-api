import { Module, Global } from '@nestjs/common';

import * as services from '@application/services';
import * as useCases from '@application/use-cases';

const serviceList = Object.values(services);
const useCaseList = Object.values(useCases);

@Global()
@Module({
  providers: [...serviceList, ...useCaseList],
  exports: [...serviceList, ...useCaseList],
})
export class GlobalApplicationModule {}
