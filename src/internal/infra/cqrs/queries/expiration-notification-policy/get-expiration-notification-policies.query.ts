import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetExpirationNotificationPoliciesDto,
  GetExpirationNotificationPoliciesResultDto,
} from '@application/dto';
import { GetExpirationNotificationPoliciesUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationNotificationPoliciesQuery {
  private constructor(
    public readonly payload: GetExpirationNotificationPoliciesDto,
  ) {}

  static create(payload: GetExpirationNotificationPoliciesDto) {
    return new GetExpirationNotificationPoliciesQuery(payload);
  }
}

@QueryHandler(GetExpirationNotificationPoliciesQuery)
export class GetExpirationNotificationPoliciesHandler
  extends BaseQueryHandler<
    GetExpirationNotificationPoliciesQuery,
    GetExpirationNotificationPoliciesResultDto
  >
  implements IQueryHandler<GetExpirationNotificationPoliciesQuery>
{
  constructor(
    private readonly useCase: GetExpirationNotificationPoliciesUseCase,
  ) {
    super();
  }

  async execute(
    query: GetExpirationNotificationPoliciesQuery,
  ): Promise<GetExpirationNotificationPoliciesResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
