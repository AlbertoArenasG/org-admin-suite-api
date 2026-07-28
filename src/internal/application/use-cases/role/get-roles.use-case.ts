import { Inject, Injectable } from '@nestjs/common';

import { GetRolesDto, GetRolesResultDto } from '@application/dto';
import { RoleMapper } from '@application/mappers';
import { AuditUserFetcherService } from '@application/services';
import {
  FindRolesParams,
  IRoleReadRepository,
  IRoleReadRepositoryToken,
} from '@domain/ports/repositories';

@Injectable()
export class GetRolesUseCase {
  constructor(
    @Inject(IRoleReadRepositoryToken)
    private readonly roleReadRepository: IRoleReadRepository,
    private readonly auditUserFetcher: AuditUserFetcherService,
  ) {}

  async execute(input: GetRolesDto): Promise<GetRolesResultDto> {
    const params: FindRolesParams = {
      page: input.page,
      perPage: input.perPage,
      actorSystemRole: input.actorSystemRole,
      search: input.search ?? null,
      scope: input.scope ?? null,
      status: input.status ?? null,
      isSystem: input.isSystem ?? null,
      sorts: input.sorts,
    };

    const { data: roles, total } =
      await this.roleReadRepository.findAll(params);

    const userIds = Array.from(
      new Set(
        roles.flatMap((role) =>
          [role.createdBy, role.updatedBy].filter((value): value is string =>
            Boolean(value),
          ),
        ),
      ),
    );

    const users = await Promise.all(
      userIds.map((userId) => this.auditUserFetcher.fetchAuditUser(userId)),
    );

    const usersById = new Map(
      users
        .filter((user): user is NonNullable<typeof user> => user !== null)
        .map((user) => [user.userId, user]),
    );

    return {
      items: RoleMapper.toCollection(roles, usersById),
      total,
      page: input.page,
      perPage: input.perPage,
    };
  }
}
