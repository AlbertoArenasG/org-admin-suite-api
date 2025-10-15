import { User } from '@domain/entities/user.entity';

export interface IUserReadRepository {
  findByEmail(email: string): Promise<{ data: User | null }>;
}

export const IUserReadRepositoryToken = Symbol('IUserReadRepository');
