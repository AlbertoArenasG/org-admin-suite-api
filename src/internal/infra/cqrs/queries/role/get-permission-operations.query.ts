import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPermissionOperationsResultDto } from '@application/dto';
import { GetPermissionOperationsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetPermissionOperationsQuery {
  static create() {
    return new GetPermissionOperationsQuery();
  }
}

@QueryHandler(GetPermissionOperationsQuery)
export class GetPermissionOperationsHandler
  extends BaseQueryHandler<
    GetPermissionOperationsQuery,
    GetPermissionOperationsResultDto
  >
  implements IQueryHandler<GetPermissionOperationsQuery>
{
  constructor(private readonly useCase: GetPermissionOperationsUseCase) {
    super();
  }

  async execute(
    query: GetPermissionOperationsQuery,
  ): Promise<GetPermissionOperationsResultDto> {
    return this.run(query, () => this.useCase.execute());
  }
}
