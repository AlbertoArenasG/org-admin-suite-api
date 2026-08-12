import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetRecipientGroupsDto,
  GetRecipientGroupsResultDto,
} from '@application/dto';
import { GetRecipientGroupsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetRecipientGroupsQuery {
  private constructor(public readonly payload: GetRecipientGroupsDto) {}

  static create(payload: GetRecipientGroupsDto) {
    return new GetRecipientGroupsQuery(payload);
  }
}

@QueryHandler(GetRecipientGroupsQuery)
export class GetRecipientGroupsHandler
  extends BaseQueryHandler<GetRecipientGroupsQuery, GetRecipientGroupsResultDto>
  implements IQueryHandler<GetRecipientGroupsQuery>
{
  constructor(private readonly useCase: GetRecipientGroupsUseCase) {
    super();
  }

  async execute(
    query: GetRecipientGroupsQuery,
  ): Promise<GetRecipientGroupsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
