import { Inject, Injectable } from '@nestjs/common';

import {
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class UserRoleNameResolverService {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
  ) {}

  async resolveByUsers(
    users: Array<{ roleId: string | null }>,
  ): Promise<Map<string, string>> {
    const roleIds = [
      ...new Set(
        users
          .map((user) => user.roleId)
          .filter((roleId): roleId is string => Boolean(roleId)),
      ),
    ];
    const resolvedRoles = await Promise.all(
      roleIds.map(async (roleId) => {
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
