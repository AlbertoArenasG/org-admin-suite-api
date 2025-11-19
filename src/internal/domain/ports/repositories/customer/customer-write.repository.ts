import { Customer } from '@domain/entities';

export interface ICustomerWriteRepository {
  create(customer: Customer): Promise<{ data: Customer | null }>;
  update(customer: Customer): Promise<{ data: Customer | null }>;
}

export const ICustomerWriteRepositoryToken = Symbol('ICustomerWriteRepository');
