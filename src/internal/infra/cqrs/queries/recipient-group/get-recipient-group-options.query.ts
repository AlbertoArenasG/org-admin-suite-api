import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetRecipientGroupOptionsDto,
  GetRecipientGroupOptionsResultDto,
} from '@application/dto';
import { GetRecipientGroupOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetRecipientGroupOptionsQuery {
  private constructor(public readonly payload: GetRecipientGroupOptionsDto) {}

  static create(payload: GetRecipientGroupOptionsDto) {
    return new GetRecipientGroupOptionsQuery(payload);
  }
}

@QueryHandler(GetRecipientGroupOptionsQuery)
export class GetRecipientGroupOptionsHandler
  extends BaseQueryHandler<
    GetRecipientGroupOptionsQuery,
    GetRecipientGroupOptionsResultDto
  >
  implements IQueryHandler<GetRecipientGroupOptionsQuery>
{
  constructor(private readonly useCase: GetRecipientGroupOptionsUseCase) {
    super();
  }

  async execute(query: GetRecipientGroupOptionsQuery) {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
