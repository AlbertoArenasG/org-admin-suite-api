import { Global, Module } from '@nestjs/common';

import {
  NotificationServiceTokens,
  NotificationServicesConfig,
} from '@infra/notification';

@Global()
@Module({
  providers: NotificationServicesConfig,
  exports: NotificationServiceTokens,
})
export class GlobalNotificationModule {}
