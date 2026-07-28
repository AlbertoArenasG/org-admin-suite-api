import { Inject, Injectable } from '@nestjs/common';

import { DeleteRoleDto } from '@application/dto';
import {
  InvalidValueException,
  InvalidValueExceptionCode,
} from '@domain/exceptions';
import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IRoleWriteRepository,
  IRoleWriteRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { RoleMutationPolicy } from './shared/role-mutation-policy';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    @Inject(IRoleWriteRepositoryToken)
    private readonly roleWriteRepository: IRoleWriteRepository,
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async execute(input: DeleteRoleDto): Promise<void> {
    const { roleId, actorUserId } = input;

    const { data } = await this.roleReadRepository.findById(roleId);
    const role = RoleMutationPolicy.ensureExists(data, roleId);

    RoleMutationPolicy.ensureMutable(role);

    const linkedUsers = await this.userReadRepository.countByRoleId(roleId);

    if (linkedUsers > 0) {
      throw InvalidValueException.create(InvalidValueExceptionCode.DEFAULT, {
        field: 'role',
        reason: 'ROLE_HAS_LINKED_USERS',
        roleId,
        linkedUsers,
      });
    }

    role.markAsDeleted(actorUserId);
    await this.roleWriteRepository.update(role);
  }
}
