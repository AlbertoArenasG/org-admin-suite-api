import { UserCustomerRelationship } from '@domain/entities';

export interface IUserCustomerRelationshipReadRepository {
  findByUserId(userId: string): Promise<{ data: UserCustomerRelationship[] }>;
  findByUserIds(
    userIds: string[],
  ): Promise<{ data: UserCustomerRelationship[] }>;
  findByCustomerId(
    customerId: string,
  ): Promise<{ data: UserCustomerRelationship[] }>;
}

export const IUserCustomerRelationshipReadRepositoryToken = Symbol(
  'IUserCustomerRelationshipReadRepository',
);
