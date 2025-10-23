import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUsersDto, GetUsersResultDto } from '@application/dto';
import { GetUsersUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetUsersQuery {
  private constructor(public readonly params: GetUsersDto) {}

  static create(params: GetUsersDto) {
    return new GetUsersQuery(params);
  }
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler
  extends BaseQueryHandler<GetUsersQuery, GetUsersResultDto>
  implements IQueryHandler<GetUsersQuery>
{
  constructor(private readonly useCase: GetUsersUseCase) {
    super();
  }

  async execute(query: GetUsersQuery): Promise<GetUsersResultDto> {
    return this.run(query, () => this.useCase.execute(query.params));
  }
}
