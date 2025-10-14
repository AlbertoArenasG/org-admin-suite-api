import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema, EnvService } from '@infra/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
      expandVariables: true,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class GlobalEnvModule {}
