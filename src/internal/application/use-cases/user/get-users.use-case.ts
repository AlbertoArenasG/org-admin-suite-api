import { Inject, Injectable } from '@nestjs/common';

import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import {
  GetUsersDto,
  GetUsersResultDto,
  UserCustomerRelationshipFilter,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import {
  CustomerContextValidationService,
  UserRoleNameResolverService,
} from '@application/services';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    private readonly customerContextValidationService: CustomerContextValidationService,
    private readonly userRoleNameResolverService: UserRoleNameResolverService,
  ) {}

  async execute(input: GetUsersDto): Promise<GetUsersResultDto> {
    const { data, total } = await this.findUsers(input);
    const roleNamesByRoleId =
      await this.userRoleNameResolverService.resolveByUsers(data);

    return {
      items: UserResultMapper.toUserViewCollection(data, roleNamesByRoleId),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }

  private async findUsers(input: GetUsersDto) {
    if (input.customerId) {
      await this.customerContextValidationService.ensureReadable(
        input.customerId,
      );

      return this.userReadRepository.findRelatedToCustomer({
        customerId: input.customerId,
        page: input.page,
        perPage: input.perPage,
        sorts: input.sorts,
        search: input.search,
      });
    }

    if (
      input.customerRelationship === UserCustomerRelationshipFilter.UNASSIGNED
    ) {
      return this.userReadRepository.findUnassigned({
        page: input.page,
        perPage: input.perPage,
        sorts: input.sorts,
        search: input.search,
      });
    }

    return this.userReadRepository.findAll(input);
  }
}
