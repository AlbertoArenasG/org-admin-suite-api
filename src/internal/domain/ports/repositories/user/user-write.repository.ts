import { User } from '@domain/entities/user.entity';

export interface IUserWriteRepository {
  create(user: User): Promise<{ data: User | null }>;
}

export const IUserWriteRepositoryToken = Symbol('IUserWriteRepository');
