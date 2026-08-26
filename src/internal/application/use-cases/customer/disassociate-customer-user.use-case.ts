import { Injectable } from '@nestjs/common';

import {
  DisassociateCustomerUserDto,
  DisassociateCustomerUserResultDto,
} from '@application/dto';
import { UserResultMapper } from '@application/mappers';
import {
  UserCustomerRelationshipManagerService,
  UserRoleNameResolverService,
} from '@application/services';

@Injectable()
export class DisassociateCustomerUserUseCase {
  constructor(
    private readonly relationshipManagerService: UserCustomerRelationshipManagerService,
    private readonly userRoleNameResolverService: UserRoleNameResolverService,
  ) {}

  async execute(
    input: DisassociateCustomerUserDto,
  ): Promise<DisassociateCustomerUserResultDto> {
    const user = await this.relationshipManagerService.disassociate(input);
    const roleNamesByRoleId =
      await this.userRoleNameResolverService.resolveByUsers([user]);

    return UserResultMapper.toUserViewDto(
      user,
      user.roleId ? (roleNamesByRoleId.get(user.roleId) ?? null) : null,
    );
  }
}
