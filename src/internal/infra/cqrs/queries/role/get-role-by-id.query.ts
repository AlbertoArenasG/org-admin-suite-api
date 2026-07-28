import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetRoleByIdResultDto } from '@application/dto';
import { GetRoleByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetRoleByIdQuery {
  private constructor(public readonly roleId: string) {}

  static create(roleId: string) {
    return new GetRoleByIdQuery(roleId);
  }
}

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler
  extends BaseQueryHandler<GetRoleByIdQuery, GetRoleByIdResultDto>
  implements IQueryHandler<GetRoleByIdQuery>
{
  constructor(private readonly useCase: GetRoleByIdUseCase) {
    super();
  }

  async execute(query: GetRoleByIdQuery): Promise<GetRoleByIdResultDto> {
    return this.run(query, () => this.useCase.execute(query.roleId));
  }
}
