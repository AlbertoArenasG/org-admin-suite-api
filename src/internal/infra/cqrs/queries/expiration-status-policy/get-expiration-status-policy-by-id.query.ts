import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetExpirationStatusPolicyByIdResultDto } from '@application/dto';
import { GetExpirationStatusPolicyByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationStatusPolicyByIdQuery {
  private constructor(public readonly payload: string) {}

  static create(expirationStatusPolicyId: string) {
    return new GetExpirationStatusPolicyByIdQuery(expirationStatusPolicyId);
  }
}

@QueryHandler(GetExpirationStatusPolicyByIdQuery)
export class GetExpirationStatusPolicyByIdHandler
  extends BaseQueryHandler<
    GetExpirationStatusPolicyByIdQuery,
    GetExpirationStatusPolicyByIdResultDto
  >
  implements IQueryHandler<GetExpirationStatusPolicyByIdQuery>
{
  constructor(private readonly useCase: GetExpirationStatusPolicyByIdUseCase) {
    super();
  }

  async execute(
    query: GetExpirationStatusPolicyByIdQuery,
  ): Promise<GetExpirationStatusPolicyByIdResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
