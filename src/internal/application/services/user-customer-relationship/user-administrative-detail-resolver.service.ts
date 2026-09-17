import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';
import { Customer, User } from '@domain/entities';
import { UserViewDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';

@Injectable()
export class UserAdministrativeDetailResolverService {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async resolve(user: User, includeCustomers = false): Promise<UserViewDto> {
    const roleName = user.roleId
      ? ((await this.roleReadRepository.findById(user.roleId)).data?.name ??
        null)
      : null;

    if (!includeCustomers) {
      return UserResultMapper.toUserViewDto(user, roleName);
    }

    const { data: relationships } =
      await this.relationshipReadRepository.findByUserId(user.id);
    const { data: customers } = await this.customerReadRepository.findByIds(
      relationships.map((relationship) => relationship.customerId),
    );

    return UserResultMapper.toUserViewDto(
      user,
      roleName,
      this.sortCustomers(customers),
    );
  }

  private sortCustomers(customers: Customer[]) {
    return customers
      .map((customer) => ({
        id: customer.id,
        companyName: customer.companyName,
        status: customer.status,
      }))
      .sort(
        (first, second) =>
          first.companyName.localeCompare(second.companyName, 'es') ||
          first.id.localeCompare(second.id),
      );
  }
}
