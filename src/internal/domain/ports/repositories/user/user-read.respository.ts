import { User } from '@domain/entities/user.entity';

export type UserSortField = 'name' | 'lastname';
export type SortDirection = 'asc' | 'desc';

export interface FindUsersParams {
  page: number;
  perPage: number;
  includeMasterUsers: boolean;
  sortBy: UserSortField;
  sortDirection: SortDirection;
}

export interface FindUsersResult {
  data: User[];
  total: number;
}

export interface IUserReadRepository {
  findByEmail(email: string): Promise<{ data: User | null }>;
  findById(userId: string): Promise<{ data: User | null }>;
  findAll(params: FindUsersParams): Promise<FindUsersResult>;
}

export const IUserReadRepositoryToken = Symbol('IUserReadRepository');
