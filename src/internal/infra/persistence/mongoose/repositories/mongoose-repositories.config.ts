import {
  MongooseTenantReadRepositoryImpl,
  MongooseTenantWriteRepositoryImpl,
  MongooseTenantUserWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
} from '.';

import {
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
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
    provide: ITenantUserWriteRepositoryToken,
    useClass: MongooseTenantUserWriteRepositoryImpl,
  },
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
  ITenantUserWriteRepositoryToken,
];
