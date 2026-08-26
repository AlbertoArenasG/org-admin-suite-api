import { UserCustomerRelationship } from '@domain/entities';

export interface IUserCustomerRelationshipWriteRepository {
  create(
    relationship: UserCustomerRelationship,
  ): Promise<{ data: UserCustomerRelationship }>;
  createMany(
    relationships: UserCustomerRelationship[],
  ): Promise<{ data: UserCustomerRelationship[] }>;
  deleteByUserIdAndCustomerId(
    userId: string,
    customerId: string,
  ): Promise<{ deleted: boolean }>;
  replaceForUser(
    userId: string,
    relationships: UserCustomerRelationship[],
  ): Promise<void>;
}

export const IUserCustomerRelationshipWriteRepositoryToken = Symbol(
  'IUserCustomerRelationshipWriteRepository',
);
