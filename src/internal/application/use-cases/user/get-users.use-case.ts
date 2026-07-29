import { Inject, Injectable } from '@nestjs/common';

import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
  IUserReadRepository,
  IUserReadRepositoryToken,
} from '@domain/ports/repositories';
import { GetUsersDto, GetUsersResultDto } from '@application/dto';
import { UserResultMapper } from '@application/mappers';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(IUserReadRepositoryToken)
    private readonly userReadRepository: IUserReadRepository,
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  async execute(input: GetUsersDto): Promise<GetUsersResultDto> {
    const { data, total } = await this.userReadRepository.findAll(input);
    const roleNamesByRoleId = await this.resolveRoleNamesByRoleId(data);

    return {
      items: UserResultMapper.toUserViewCollection(data, roleNamesByRoleId),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }

  private async resolveRoleNamesByRoleId(users: { roleId: string | null }[]) {
    const uniqueRoleIds = Array.from(
      new Set(
        users
          .map((user) => user.roleId)
          .filter((roleId): roleId is string => Boolean(roleId)),
      ),
    );

    const resolvedRoles = await Promise.all(
      uniqueRoleIds.map(async (roleId) => {
        const { data } = await this.roleReadRepository.findById(roleId);
        return [roleId, data?.name ?? null] as const;
      }),
    );

    return new Map(
      resolvedRoles.filter(
        (entry): entry is readonly [string, string] => entry[1] !== null,
      ),
    );
  }
}
