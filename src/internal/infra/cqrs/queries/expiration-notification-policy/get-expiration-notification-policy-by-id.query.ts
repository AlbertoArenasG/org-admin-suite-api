import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetExpirationNotificationPolicyByIdResultDto } from '@application/dto';
import { GetExpirationNotificationPolicyByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetExpirationNotificationPolicyByIdQuery {
  private constructor(public readonly payload: string) {}

  static create(expirationNotificationPolicyId: string) {
    return new GetExpirationNotificationPolicyByIdQuery(
      expirationNotificationPolicyId,
    );
  }
}

@QueryHandler(GetExpirationNotificationPolicyByIdQuery)
export class GetExpirationNotificationPolicyByIdHandler
  extends BaseQueryHandler<
    GetExpirationNotificationPolicyByIdQuery,
    GetExpirationNotificationPolicyByIdResultDto
  >
  implements IQueryHandler<GetExpirationNotificationPolicyByIdQuery>
{
  constructor(
    private readonly useCase: GetExpirationNotificationPolicyByIdUseCase,
  ) {
    super();
  }

  async execute(
    query: GetExpirationNotificationPolicyByIdQuery,
  ): Promise<GetExpirationNotificationPolicyByIdResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
