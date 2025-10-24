import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUserRolesDto, GetUserRolesResultDto } from '@application/dto';
import { GetUserRolesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetUserRolesQuery {
  private constructor(public readonly payload: GetUserRolesDto) {}

  static create(payload: GetUserRolesDto) {
    return new GetUserRolesQuery(payload);
  }
}

@QueryHandler(GetUserRolesQuery)
export class GetUserRolesHandler
  extends BaseQueryHandler<GetUserRolesQuery, GetUserRolesResultDto>
  implements IQueryHandler<GetUserRolesQuery>
{
  constructor(private readonly useCase: GetUserRolesUseCase) {
    super();
  }

  async execute(query: GetUserRolesQuery): Promise<GetUserRolesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
