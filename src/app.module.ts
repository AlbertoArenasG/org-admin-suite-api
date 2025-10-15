import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { HttpExceptionsFilter } from '@infra/api/filters/http-exception.filter';
import * as modules from '@modules/index';

const modulesList = Object.values(modules);

@Module({
  imports: [...modulesList],
  controllers: [],
  providers: [
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
