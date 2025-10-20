import {
  MongooseTenantReadRepositoryImpl,
  MongooseTenantWriteRepositoryImpl,
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
} from '.';

import {
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
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
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
  ITenantReadRepositoryToken,
  ITenantWriteRepositoryToken,
];
