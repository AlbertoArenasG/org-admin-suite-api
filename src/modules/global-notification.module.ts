import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvService } from '@infra/env';

import {
  NotificationServiceTokens,
  NotificationServicesConfig,
} from '@infra/notification';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (envService: EnvService) => ({
        transport: {
          host: envService.get('MAILER_HOST'),
          port: parseInt(envService.get('MAILER_PORT')),
          secure: true,
          auth: {
            user: envService.get('MAILER_USER'),
            pass: envService.get('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: envService.get('MAILER_FROM'),
        },
      }),
      inject: [EnvService],
    }),
  ],
  providers: NotificationServicesConfig,
  exports: NotificationServiceTokens,
})
export class GlobalNotificationModule {}
