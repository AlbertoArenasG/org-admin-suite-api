import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetRolesDto, GetRolesResultDto } from '@application/dto';
import { GetRolesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetRolesQuery {
  private constructor(public readonly payload: GetRolesDto) {}

  static create(payload: GetRolesDto) {
    return new GetRolesQuery(payload);
  }
}

@QueryHandler(GetRolesQuery)
export class GetRolesHandler
  extends BaseQueryHandler<GetRolesQuery, GetRolesResultDto>
  implements IQueryHandler<GetRolesQuery>
{
  constructor(private readonly useCase: GetRolesUseCase) {
    super();
  }

  async execute(query: GetRolesQuery): Promise<GetRolesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
