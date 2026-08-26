import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerReadRepository,
  ICustomerReadRepositoryToken,
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
  IUserCustomerRelationshipReadRepository,
  IUserCustomerRelationshipReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  AuthorizationException,
  EntityNotFoundException,
  EntityNotFoundExceptionCode,
} from '@domain/exceptions';
import { Customer, SystemRole, User, UserStatus } from '@domain/entities';
import { UserViewDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IUserCustomerRelationshipReadRepositoryToken)
    private readonly relationshipReadRepository: IUserCustomerRelationshipReadRepository,
    @Inject(ICustomerReadRepositoryToken)
    private readonly customerReadRepository: ICustomerReadRepository,
  ) {}

  async execute(
    userId: string,
    actorSystemRole: SystemRole,
    includeCustomers = false,
  ): Promise<UserViewDto> {
    const { data } = await this.userReadRepository.findById(userId);

    if (!data || data.status === UserStatus.DELETED) {
      throw EntityNotFoundException.create(EntityNotFoundExceptionCode.USER, {
        userId,
      });
    }

    if (
      actorSystemRole !== SystemRole.MASTER_ADMIN &&
      User.isMasterSystemRole(data.systemRole)
    ) {
      throw AuthorizationException.masterPrivilegesRequired();
    }

    const roleName = data.roleId
      ? ((await this.roleReadRepository.findById(data.roleId)).data?.name ??
        null)
      : null;

    if (!includeCustomers) {
      return UserResultMapper.toUserViewDto(data, roleName);
    }

    const { data: relationships } =
      await this.relationshipReadRepository.findByUserId(data.id);
    const { data: customers } = await this.customerReadRepository.findByIds(
      relationships.map((relationship) => relationship.customerId),
    );

    return UserResultMapper.toUserViewDto(
      data,
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
