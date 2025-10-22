import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  AuthenticateUserHandler,
  CompleteNewUserRegistrationInvitationHandler,
  CreateMasterUserHandler,
  CreateMasterUserRegistrationInvitationHandler,
  CreateTenantHandler,
  CreateTenantUserRegistrationInvitationHandler,
  CreateUserAndNotifyHandler,
  RespondUserRegistrationInvitationHandler,
} from '@infra/cqrs/commands';
import { GetUserRegistrationInvitationHandler } from '@infra/cqrs/queries';

const providers = [
  AuthenticateUserHandler,
  CreateTenantHandler,
  CreateUserAndNotifyHandler,
  CreateMasterUserHandler,
  CreateTenantUserRegistrationInvitationHandler,
  CreateMasterUserRegistrationInvitationHandler,
  CompleteNewUserRegistrationInvitationHandler,
  RespondUserRegistrationInvitationHandler,
  GetUserRegistrationInvitationHandler,
];

@Global()
@Module({
  imports: [CqrsModule],
  providers,
})
export class GlobalCqrsModule {}
