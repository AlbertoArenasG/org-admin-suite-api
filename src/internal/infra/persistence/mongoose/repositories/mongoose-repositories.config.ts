import {
  MongooseUserRegistrationInvitationReadRepositoryImpl,
  MongooseUserRegistrationInvitationWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
  MongooseFileRepositoryImpl,
  MongooseServiceEntryRepositoryImpl,
} from '.';

import {
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IFileRepositoryToken,
  IServiceEntryRepositoryToken,
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
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IFileRepositoryToken,
  IServiceEntryRepositoryToken,
];
