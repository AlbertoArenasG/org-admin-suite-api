import {
  MongooseUserRegistrationInvitationReadRepositoryImpl,
  MongooseUserRegistrationInvitationWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
  MongooseFileRepositoryImpl,
  MongooseServiceEntryRepositoryImpl,
  MongooseServiceEntryAccessRepositoryImpl,
  MongooseServiceEntrySurveyRepositoryImpl,
} from '.';

import {
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IFileRepositoryToken,
  IServiceEntryRepositoryToken,
  IServiceEntryAccessRepositoryToken,
  IServiceEntrySurveyRepositoryToken,
} from '@domain/ports/repositories';

export const MongooseRepositoriesConfig = [
  {
    provide: IUserReadRepositoryToken,
    useClass: MongooseUserReadRepositoryImpl,
  },
  {
    provide: IUserWriteRepositoryToken,
    useClass: MongooseUserWriteRepositoryImpl,
  },
  {
    provide: IUserRegistrationInvitationReadRepositoryToken,
    useClass: MongooseUserRegistrationInvitationReadRepositoryImpl,
  },
  {
    provide: IUserRegistrationInvitationWriteRepositoryToken,
    useClass: MongooseUserRegistrationInvitationWriteRepositoryImpl,
  },
  {
    provide: IFileRepositoryToken,
    useClass: MongooseFileRepositoryImpl,
  },
  {
    provide: IServiceEntryRepositoryToken,
    useClass: MongooseServiceEntryRepositoryImpl,
  },
  {
    provide: IServiceEntryAccessRepositoryToken,
    useClass: MongooseServiceEntryAccessRepositoryImpl,
  },
  {
    provide: IServiceEntrySurveyRepositoryToken,
    useClass: MongooseServiceEntrySurveyRepositoryImpl,
  },
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IFileRepositoryToken,
  IServiceEntryRepositoryToken,
  IServiceEntryAccessRepositoryToken,
  IServiceEntrySurveyRepositoryToken,
];
