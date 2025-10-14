import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { AppController } from '@infra/api/controllers/health/app.controller';

@Module({
  imports: [TerminusModule],
  controllers: [AppController],
})
export class HealthModule {}
