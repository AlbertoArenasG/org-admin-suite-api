import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as modules from '@modules/index';

const modulesList = Object.values(modules);

@Module({
  imports: [...modulesList],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
