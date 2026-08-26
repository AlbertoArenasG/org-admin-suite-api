import { Customer, CustomerStatus } from '@domain/entities';

export interface FindCustomersParams {
  page: number;
  perPage: number;
  search?: string | null;
  status?: CustomerStatus | null;
  sorts: Array<{
    field: 'company_name' | 'client_code' | 'customer_status' | 'created_at';
    direction: 'asc' | 'desc';
  }>;
}

export interface FindCustomersResult {
  data: Customer[];
  total: number;
}

export interface ICustomerReadRepository {
  findById(id: string): Promise<{ data: Customer | null }>;
  findByIds(ids: string[]): Promise<{ data: Customer[] }>;
  findByClientCode(clientCode: string): Promise<{ data: Customer | null }>;
  findByAccessToken(accessToken: string): Promise<{ data: Customer | null }>;
  findAll(params: FindCustomersParams): Promise<FindCustomersResult>;
}

export const ICustomerReadRepositoryToken = Symbol('ICustomerReadRepository');
