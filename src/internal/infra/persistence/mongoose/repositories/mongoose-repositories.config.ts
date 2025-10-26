import {
  MongooseUserRegistrationInvitationReadRepositoryImpl,
  MongooseUserRegistrationInvitationWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
  MongooseFileReadRepositoryImpl,
  MongooseFileWriteRepositoryImpl,
  MongooseServiceEntryReadRepositoryImpl,
  MongooseServiceEntryWriteRepositoryImpl,
  MongooseServiceEntryAccessReadRepositoryImpl,
  MongooseServiceEntryAccessWriteRepositoryImpl,
  MongooseServiceEntrySurveyReadRepositoryImpl,
  MongooseServiceEntrySurveyWriteRepositoryImpl,
  MongooseServiceEntrySurveyTemplateReadRepositoryImpl,
} from '.';

import {
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IFileReadRepositoryToken,
  IFileWriteRepositoryToken,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepositoryToken,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepositoryToken,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntrySurveyWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepositoryToken,
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
    provide: IFileReadRepositoryToken,
    useClass: MongooseFileReadRepositoryImpl,
  },
  {
    provide: IFileWriteRepositoryToken,
    useClass: MongooseFileWriteRepositoryImpl,
  },
  {
    provide: IServiceEntryReadRepositoryToken,
    useClass: MongooseServiceEntryReadRepositoryImpl,
  },
  {
    provide: IServiceEntryWriteRepositoryToken,
    useClass: MongooseServiceEntryWriteRepositoryImpl,
  },
  {
    provide: IServiceEntryAccessReadRepositoryToken,
    useClass: MongooseServiceEntryAccessReadRepositoryImpl,
  },
  {
    provide: IServiceEntryAccessWriteRepositoryToken,
    useClass: MongooseServiceEntryAccessWriteRepositoryImpl,
  },
  {
    provide: IServiceEntrySurveyReadRepositoryToken,
    useClass: MongooseServiceEntrySurveyReadRepositoryImpl,
  },
  {
    provide: IServiceEntrySurveyWriteRepositoryToken,
    useClass: MongooseServiceEntrySurveyWriteRepositoryImpl,
  },
  {
    provide: IServiceEntrySurveyTemplateReadRepositoryToken,
    useClass: MongooseServiceEntrySurveyTemplateReadRepositoryImpl,
  },
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IFileReadRepositoryToken,
  IFileWriteRepositoryToken,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepositoryToken,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepositoryToken,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntrySurveyWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepositoryToken,
];
