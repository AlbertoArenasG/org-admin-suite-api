import { SystemRole } from '@domain/entities';
import { User } from '@domain/entities/user.entity';

export type UserSortField =
  | 'name'
  | 'lastname'
  | 'email'
  | 'status'
  | 'role'
  | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface FindUsersParams {
  page: number;
  perPage: number;
  actorSystemRole: SystemRole;
  sorts: Array<{ field: UserSortField; direction: SortDirection }>;
  search: string | null;
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
