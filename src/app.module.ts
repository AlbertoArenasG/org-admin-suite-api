import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';

import { HttpExceptionsFilter } from '@infra/api/filters/http-exception.filter';
import { LoggingInterceptor } from '@infra/api/interceptors/global-logging.interceptor';
import * as modules from '@modules/index';

const modulesList = Object.values(modules);

@Module({
  imports: [...modulesList],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
