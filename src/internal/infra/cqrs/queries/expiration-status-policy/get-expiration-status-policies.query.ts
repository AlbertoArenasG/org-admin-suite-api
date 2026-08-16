import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetExpirationStatusPoliciesDto,
  GetExpirationStatusPoliciesResultDto,
} from '@application/dto';
import { GetExpirationStatusPoliciesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationStatusPoliciesQuery {
  private constructor(
    public readonly payload: GetExpirationStatusPoliciesDto,
  ) {}

  static create(payload: GetExpirationStatusPoliciesDto) {
    return new GetExpirationStatusPoliciesQuery(payload);
  }
}

@QueryHandler(GetExpirationStatusPoliciesQuery)
export class GetExpirationStatusPoliciesHandler
  extends BaseQueryHandler<
    GetExpirationStatusPoliciesQuery,
    GetExpirationStatusPoliciesResultDto
  >
  implements IQueryHandler<GetExpirationStatusPoliciesQuery>
{
  constructor(private readonly useCase: GetExpirationStatusPoliciesUseCase) {
    super();
  }

  async execute(
    query: GetExpirationStatusPoliciesQuery,
  ): Promise<GetExpirationStatusPoliciesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
