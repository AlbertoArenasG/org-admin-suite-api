import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetExpirationStatusPolicyOptionsDto,
  GetExpirationStatusPolicyOptionsResultDto,
} from '@application/dto';
import { GetExpirationStatusPolicyOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationStatusPolicyOptionsQuery {
  private constructor(
    public readonly payload: GetExpirationStatusPolicyOptionsDto,
  ) {}

  static create(payload: GetExpirationStatusPolicyOptionsDto) {
    return new GetExpirationStatusPolicyOptionsQuery(payload);
  }
}

@QueryHandler(GetExpirationStatusPolicyOptionsQuery)
export class GetExpirationStatusPolicyOptionsHandler
  extends BaseQueryHandler<
    GetExpirationStatusPolicyOptionsQuery,
    GetExpirationStatusPolicyOptionsResultDto
  >
  implements IQueryHandler<GetExpirationStatusPolicyOptionsQuery>
{
  constructor(
    private readonly useCase: GetExpirationStatusPolicyOptionsUseCase,
  ) {
    super();
  }

  async execute(
    query: GetExpirationStatusPolicyOptionsQuery,
  ): Promise<GetExpirationStatusPolicyOptionsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
