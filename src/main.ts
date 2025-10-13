import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { corsConfig } from '@src/config';
import { EnvService } from './internal/infra/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(EnvService);
  const PORT = configService.get('PORT');

  app.enableCors(corsConfig);

  await app.listen(PORT);
}
bootstrap();
