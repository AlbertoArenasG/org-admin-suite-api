import { Injectable } from '@nestjs/common';

import {
  AssociateCustomerUserDto,
  AssociateCustomerUserResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import {
  UserCustomerRelationshipManagerService,
  UserRoleNameResolverService,
} from '@application/services';

@Injectable()
export class AssociateCustomerUserUseCase {
  constructor(
    private readonly relationshipManagerService: UserCustomerRelationshipManagerService,
    private readonly userRoleNameResolverService: UserRoleNameResolverService,
  ) {}

  async execute(
    input: AssociateCustomerUserDto,
  ): Promise<AssociateCustomerUserResultDto> {
    const user = await this.relationshipManagerService.associate(input);
    const roleNamesByRoleId =
      await this.userRoleNameResolverService.resolveByUsers([user]);

    return UserResultMapper.toUserViewDto(
      user,
      user.roleId ? (roleNamesByRoleId.get(user.roleId) ?? null) : null,
    );
  }
}
