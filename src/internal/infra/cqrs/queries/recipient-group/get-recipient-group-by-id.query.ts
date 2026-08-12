import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetRecipientGroupByIdResultDto } from '@application/dto';
import { GetRecipientGroupByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetRecipientGroupByIdQuery {
  private constructor(public readonly payload: string) {}

  static create(recipientGroupId: string) {
    return new GetRecipientGroupByIdQuery(recipientGroupId);
  }
}

@QueryHandler(GetRecipientGroupByIdQuery)
export class GetRecipientGroupByIdHandler
  extends BaseQueryHandler<
    GetRecipientGroupByIdQuery,
    GetRecipientGroupByIdResultDto
  >
  implements IQueryHandler<GetRecipientGroupByIdQuery>
{
  constructor(private readonly useCase: GetRecipientGroupByIdUseCase) {
    super();
  }

  async execute(
    query: GetRecipientGroupByIdQuery,
  ): Promise<GetRecipientGroupByIdResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
