import { UserCustomerRelationship } from '@domain/entities';

export interface IUserCustomerRelationshipWriteRepository {
  createMany(
    relationships: UserCustomerRelationship[],
  ): Promise<{ data: UserCustomerRelationship[] }>;
  replaceForUser(
    userId: string,
    relationships: UserCustomerRelationship[],
  ): Promise<void>;
}

export const IUserCustomerRelationshipWriteRepositoryToken = Symbol(
  'IUserCustomerRelationshipWriteRepository',
);
