import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  AuthenticateUserHandler,
  CompleteNewUserRegistrationInvitationHandler,
  CreateMasterUserHandler,
  CreateMasterUserRegistrationInvitationHandler,
  CreateUserRegistrationInvitationHandler,
  CreateUserAndNotifyHandler,
} from '@infra/cqrs/commands';
import { GetUserRegistrationInvitationHandler } from '@infra/cqrs/queries';

const providers = [
  AuthenticateUserHandler,
  CreateUserAndNotifyHandler,
  CreateMasterUserHandler,
  CreateUserRegistrationInvitationHandler,
  CreateMasterUserRegistrationInvitationHandler,
  CompleteNewUserRegistrationInvitationHandler,
  GetUserRegistrationInvitationHandler,
];

@Global()
@Module({
  imports: [CqrsModule],
  providers,
})
export class GlobalCqrsModule {}
