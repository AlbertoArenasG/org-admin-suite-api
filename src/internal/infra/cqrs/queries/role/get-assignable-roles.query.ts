import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetAssignableRolesDto,
  GetAssignableRolesResultDto,
} from '@application/dto';
import { GetAssignableRolesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetAssignableRolesQuery {
  private constructor(public readonly payload: GetAssignableRolesDto) {}

  static create(payload: GetAssignableRolesDto) {
    return new GetAssignableRolesQuery(payload);
  }
}

@QueryHandler(GetAssignableRolesQuery)
export class GetAssignableRolesHandler
  extends BaseQueryHandler<GetAssignableRolesQuery, GetAssignableRolesResultDto>
  implements IQueryHandler<GetAssignableRolesQuery>
{
  constructor(private readonly useCase: GetAssignableRolesUseCase) {
    super();
  }

  async execute(
    query: GetAssignableRolesQuery,
  ): Promise<GetAssignableRolesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
