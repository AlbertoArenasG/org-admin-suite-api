import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionsFilter } from '@infra/api/filters/http-exception.filter';

import * as modules from '@modules/index';

const modulesList = Object.values(modules);

@Module({
  imports: [...modulesList],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionsFilter },
  ],
})
export class AppModule {}
