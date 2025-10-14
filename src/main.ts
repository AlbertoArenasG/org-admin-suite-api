import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { corsConfig } from '@src/config';
import { EnvService } from '@infra/env';

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(EnvService);
  const PORT = configService.get('PORT');

  app.enableCors(corsConfig);

  await app.listen(PORT);
  console.group(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
