import { Inject, Injectable } from '@nestjs/common';

import {
  GetCustomerRelatedUsersDto,
  GetCustomerRelatedUsersResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import { CustomerContextValidationService } from '@application/services';
import { UserRoleNameResolverService } from '@application/services/user-customer-relationship';
import {
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetCustomerRelatedUsersUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    private readonly customerContextValidationService: CustomerContextValidationService,
    private readonly userRoleNameResolverService: UserRoleNameResolverService,
  ) {}

  async execute(
    input: GetCustomerRelatedUsersDto,
  ): Promise<GetCustomerRelatedUsersResultDto> {
    await this.customerContextValidationService.ensureReadable(
      input.customerId,
    );

    const { data, total } =
      await this.userReadRepository.findRelatedToCustomer(input);
    const roleNamesByRoleId =
      await this.userRoleNameResolverService.resolveByUsers(data);

    return {
      items: UserResultMapper.toUserViewCollection(data, roleNamesByRoleId),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
