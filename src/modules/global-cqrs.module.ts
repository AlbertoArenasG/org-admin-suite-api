import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  AuthenticateUserHandler,
  CompleteNewUserRegistrationInvitationHandler,
  CreateMasterUserHandler,
  CreateMasterUserRegistrationInvitationHandler,
  CreateUserRegistrationInvitationHandler,
  CreateUserAndNotifyHandler,
  UpdateUserHandler,
  UpdateMyProfileHandler,
  DeleteUserHandler,
} from '@infra/cqrs/commands';
import {
  GetUserByIdHandler,
  GetUserRegistrationInvitationHandler,
  GetUsersHandler,
} from '@infra/cqrs/queries';

const providers = [
  AuthenticateUserHandler,
  CreateUserAndNotifyHandler,
  CreateMasterUserHandler,
  CreateUserRegistrationInvitationHandler,
  CreateMasterUserRegistrationInvitationHandler,
  CompleteNewUserRegistrationInvitationHandler,
  GetUserRegistrationInvitationHandler,
  GetUsersHandler,
  GetUserByIdHandler,
  UpdateUserHandler,
  UpdateMyProfileHandler,
  DeleteUserHandler,
];

@Global()
@Module({
  imports: [CqrsModule],
  providers,
})
export class GlobalCqrsModule {}
