import { JwtModule } from '@nestjs/jwt';
import { Module, Global } from '@nestjs/common';
import type { StringValue } from 'ms';

import { EnvService } from '@infra/env';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: envService.get('JWT_EXPIRATION') as StringValue,
        },
      }),
    }),
  ],
})
export class AuthModule {}
