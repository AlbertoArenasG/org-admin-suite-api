import { RecipientGroup, RecipientGroupStatus } from '@domain/entities';

export type RecipientGroupSortField = 'name' | 'status' | 'created_at';
export type RecipientGroupSortDirection = 'asc' | 'desc';

export interface FindRecipientGroupsParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: RecipientGroupStatus | null;
  sorts: Array<{
    field: RecipientGroupSortField;
    direction: RecipientGroupSortDirection;
  }>;
}

export interface FindRecipientGroupsResult {
  data: RecipientGroup[];
  total: number;
}

export interface IRecipientGroupReadRepository {
  findById(recipientGroupId: string): Promise<{ data: RecipientGroup | null }>;
  findByIds(recipientGroupIds: string[]): Promise<{ data: RecipientGroup[] }>;
  findByName(name: string): Promise<{ data: RecipientGroup | null }>;
  findByCode(code: string): Promise<{ data: RecipientGroup | null }>;
  findAll(
    params: FindRecipientGroupsParams,
  ): Promise<FindRecipientGroupsResult>;
}

export const IRecipientGroupReadRepositoryToken = Symbol(
  'IRecipientGroupReadRepository',
);
