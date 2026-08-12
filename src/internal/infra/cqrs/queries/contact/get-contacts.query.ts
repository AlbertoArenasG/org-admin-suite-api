import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetContactsDto, GetContactsResultDto } from '@application/dto';
import { GetContactsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetContactsQuery {
  private constructor(public readonly payload: GetContactsDto) {}

  static create(payload: GetContactsDto) {
    return new GetContactsQuery(payload);
  }
}

@QueryHandler(GetContactsQuery)
export class GetContactsHandler
  extends BaseQueryHandler<GetContactsQuery, GetContactsResultDto>
  implements IQueryHandler<GetContactsQuery>
{
  constructor(private readonly useCase: GetContactsUseCase) {
    super();
  }

  async execute(query: GetContactsQuery): Promise<GetContactsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
