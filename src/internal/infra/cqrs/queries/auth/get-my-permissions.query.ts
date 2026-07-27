import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetMyPermissionsDto,
  GetMyPermissionsResultDto,
} from '@application/dto';
import { GetMyPermissionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetMyPermissionsQuery {
  private constructor(public readonly payload: GetMyPermissionsDto) {}

  static create(payload: GetMyPermissionsDto) {
    return new GetMyPermissionsQuery(payload);
  }
}

@QueryHandler(GetMyPermissionsQuery)
export class GetMyPermissionsHandler
  extends BaseQueryHandler<GetMyPermissionsQuery, GetMyPermissionsResultDto>
  implements IQueryHandler<GetMyPermissionsQuery>
{
  constructor(private readonly useCase: GetMyPermissionsUseCase) {
    super();
  }

  async execute(
    query: GetMyPermissionsQuery,
  ): Promise<GetMyPermissionsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
