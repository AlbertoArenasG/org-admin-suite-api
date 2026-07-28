import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPermissionModulesResultDto } from '@application/dto';
import { GetPermissionModulesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetPermissionModulesQuery {
  static create() {
    return new GetPermissionModulesQuery();
  }
}

@QueryHandler(GetPermissionModulesQuery)
export class GetPermissionModulesHandler
  extends BaseQueryHandler<
    GetPermissionModulesQuery,
    GetPermissionModulesResultDto
  >
  implements IQueryHandler<GetPermissionModulesQuery>
{
  constructor(private readonly useCase: GetPermissionModulesUseCase) {
    super();
  }

  async execute(
    query: GetPermissionModulesQuery,
  ): Promise<GetPermissionModulesResultDto> {
    return this.run(query, () => this.useCase.execute());
  }
}
