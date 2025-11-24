import {
  MongooseUserRegistrationInvitationReadRepositoryImpl,
  MongooseUserRegistrationInvitationWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
  MongooseUserPasswordResetTokenReadRepositoryImpl,
  MongooseUserPasswordResetTokenWriteRepositoryImpl,
  MongooseFileReadRepositoryImpl,
  MongooseFileWriteRepositoryImpl,
  MongooseServiceEntryReadRepositoryImpl,
  MongooseServiceEntryWriteRepositoryImpl,
  MongooseServiceEntryAccessReadRepositoryImpl,
  MongooseServiceEntryAccessWriteRepositoryImpl,
  MongooseServiceEntrySurveyReadRepositoryImpl,
  MongooseServiceEntrySurveyWriteRepositoryImpl,
  MongooseServiceEntrySurveyTemplateReadRepositoryImpl,
  MongooseCustomerFiscalProfileReadRepositoryImpl,
  MongooseCustomerFiscalProfileWriteRepositoryImpl,
  MongooseCustomerReadRepositoryImpl,
  MongooseCustomerWriteRepositoryImpl,
  MongooseServicePackageRecordWriteRepositoryImpl,
  MongooseServicePackageRecordReadRepositoryImpl,
} from '.';

import {
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IUserPasswordResetTokenReadRepositoryToken,
  IUserPasswordResetTokenWriteRepositoryToken,
  IFileReadRepositoryToken,
  IFileWriteRepositoryToken,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepositoryToken,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepositoryToken,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntrySurveyWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepositoryToken,
  ICustomerFiscalProfileReadRepositoryToken,
  ICustomerFiscalProfileWriteRepositoryToken,
  ICustomerReadRepositoryToken,
  ICustomerWriteRepositoryToken,
  IServicePackageRecordWriteRepositoryToken,
  IServicePackageRecordReadRepositoryToken,
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
    provide: IUserPasswordResetTokenReadRepositoryToken,
    useClass: MongooseUserPasswordResetTokenReadRepositoryImpl,
  },
  {
    provide: IUserPasswordResetTokenWriteRepositoryToken,
    useClass: MongooseUserPasswordResetTokenWriteRepositoryImpl,
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
  {
    provide: ICustomerFiscalProfileReadRepositoryToken,
    useClass: MongooseCustomerFiscalProfileReadRepositoryImpl,
  },
  {
    provide: ICustomerFiscalProfileWriteRepositoryToken,
    useClass: MongooseCustomerFiscalProfileWriteRepositoryImpl,
  },
  {
    provide: ICustomerReadRepositoryToken,
    useClass: MongooseCustomerReadRepositoryImpl,
  },
  {
    provide: ICustomerWriteRepositoryToken,
    useClass: MongooseCustomerWriteRepositoryImpl,
  },
  {
    provide: IServicePackageRecordWriteRepositoryToken,
    useClass: MongooseServicePackageRecordWriteRepositoryImpl,
  },
  {
    provide: IServicePackageRecordReadRepositoryToken,
    useClass: MongooseServicePackageRecordReadRepositoryImpl,
  },
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserPasswordResetTokenReadRepositoryToken,
  IUserPasswordResetTokenWriteRepositoryToken,
  IFileReadRepositoryToken,
  IFileWriteRepositoryToken,
  IServiceEntryReadRepositoryToken,
  IServiceEntryWriteRepositoryToken,
  IServiceEntryAccessReadRepositoryToken,
  IServiceEntryAccessWriteRepositoryToken,
  IServiceEntrySurveyReadRepositoryToken,
  IServiceEntrySurveyWriteRepositoryToken,
  IServiceEntrySurveyTemplateReadRepositoryToken,
  ICustomerFiscalProfileReadRepositoryToken,
  ICustomerFiscalProfileWriteRepositoryToken,
  ICustomerReadRepositoryToken,
  ICustomerWriteRepositoryToken,
  IServicePackageRecordWriteRepositoryToken,
  IServicePackageRecordReadRepositoryToken,
];
