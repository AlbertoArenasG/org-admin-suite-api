import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetExpirationNotificationPolicyOptionsDto,
  GetExpirationNotificationPolicyOptionsResultDto,
} from '@application/dto';
import { GetExpirationNotificationPolicyOptionsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationNotificationPolicyOptionsQuery {
  private constructor(
    public readonly payload: GetExpirationNotificationPolicyOptionsDto,
  ) {}

  static create(payload: GetExpirationNotificationPolicyOptionsDto) {
    return new GetExpirationNotificationPolicyOptionsQuery(payload);
  }
}

@QueryHandler(GetExpirationNotificationPolicyOptionsQuery)
export class GetExpirationNotificationPolicyOptionsHandler
  extends BaseQueryHandler<
    GetExpirationNotificationPolicyOptionsQuery,
    GetExpirationNotificationPolicyOptionsResultDto
  >
  implements IQueryHandler<GetExpirationNotificationPolicyOptionsQuery>
{
  constructor(
    private readonly useCase: GetExpirationNotificationPolicyOptionsUseCase,
  ) {
    super();
  }

  async execute(
    query: GetExpirationNotificationPolicyOptionsQuery,
  ): Promise<GetExpirationNotificationPolicyOptionsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
