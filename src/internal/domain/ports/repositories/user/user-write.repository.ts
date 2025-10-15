import { User } from '@domain/entities/user.entity';

export interface IUserWriteRepository {
  create(user: User): Promise<{ data: User }>;
}

export const IUserWriteRepositoryToken = Symbol('IUserWriteRepository');
