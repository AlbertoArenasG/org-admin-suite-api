import {
  MongooseTenantReadRepositoryImpl,
  MongooseTenantWriteRepositoryImpl,
  MongooseTenantUserReadRepositoryImpl,
  MongooseTenantUserWriteRepositoryImpl,
  MongooseUserRegistrationInvitationReadRepositoryImpl,
  MongooseUserRegistrationInvitationWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
} from '.';

import {
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
  ITenantUserReadRepositoryToken,
  ITenantUserWriteRepositoryToken,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
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
    provide: ITenantReadRepositoryToken,
    useClass: MongooseTenantReadRepositoryImpl,
  },
  {
    provide: ITenantWriteRepositoryToken,
    useClass: MongooseTenantWriteRepositoryImpl,
  },
  {
    provide: ITenantUserReadRepositoryToken,
    useClass: MongooseTenantUserReadRepositoryImpl,
  },
  {
    provide: ITenantUserWriteRepositoryToken,
    useClass: MongooseTenantUserWriteRepositoryImpl,
  },
  {
    provide: IUserRegistrationInvitationReadRepositoryToken,
    useClass: MongooseUserRegistrationInvitationReadRepositoryImpl,
  },
  {
    provide: IUserRegistrationInvitationWriteRepositoryToken,
    useClass: MongooseUserRegistrationInvitationWriteRepositoryImpl,
  },
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
  ITenantUserReadRepositoryToken,
  ITenantUserWriteRepositoryToken,
  IUserRegistrationInvitationReadRepositoryToken,
  IUserRegistrationInvitationWriteRepositoryToken,
];
