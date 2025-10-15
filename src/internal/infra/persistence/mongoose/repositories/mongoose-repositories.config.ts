import {
  MongooseUserReadRepositoryImpl,
  MongooseUserWriteRepositoryImpl,
} from '.';

import {
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
];

export const MongooseRepositoryTokens = [
  IUserReadRepositoryToken,
  IUserWriteRepositoryToken,
];
