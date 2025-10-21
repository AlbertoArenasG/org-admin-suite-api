import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  AuthenticateUserHandler,
  CreateMasterUserHandler,
  CreateTenantHandler,
  CreateUserAndNotifyHandler,
} from '@infra/cqrs/commands';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    AuthenticateUserHandler,
    CreateTenantHandler,
    CreateUserAndNotifyHandler,
    CreateMasterUserHandler,
  ],
})
export class GlobalCqrsModule {}
