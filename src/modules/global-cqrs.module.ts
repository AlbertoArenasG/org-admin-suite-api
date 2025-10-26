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
  UploadFilesHandler,
  CreateServiceEntryHandler,
  UpdateServiceEntryHandler,
  DeleteServiceEntryHandler,
  SubmitServiceEntrySurveyHandler,
} from '@infra/cqrs/commands';
import {
  GetUserByIdHandler,
  GetUserRegistrationInvitationHandler,
  GetUsersHandler,
  GetFileByIdHandler,
  DownloadFileHandler,
  GetUserRolesHandler,
  GetServiceEntriesHandler,
  GetServiceEntryByIdHandler,
  GetServiceEntryByTokenHandler,
  GetServiceEntrySurveyStatsHandler,
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
  UploadFilesHandler,
  CreateServiceEntryHandler,
  UpdateServiceEntryHandler,
  DeleteServiceEntryHandler,
  SubmitServiceEntrySurveyHandler,
  GetFileByIdHandler,
  DownloadFileHandler,
  GetUserRolesHandler,
  GetServiceEntriesHandler,
  GetServiceEntryByIdHandler,
  GetServiceEntryByTokenHandler,
  GetServiceEntrySurveyStatsHandler,
];

@Global()
@Module({
  imports: [CqrsModule],
  providers,
})
export class GlobalCqrsModule {}
