import {
  MongooseTenantReadRepositoryImpl,
  MongooseTenantWriteRepositoryImpl,
  MongooseTenantUserReadRepositoryImpl,
  MongooseTenantUserWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
} from '.';

import {
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
  ITenantUserReadRepositoryToken,
  ITenantUserWriteRepositoryToken,
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
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
  ITenantUserReadRepositoryToken,
  ITenantUserWriteRepositoryToken,
];
