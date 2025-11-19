import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUserRegistrationInvitationUseCase } from '@application/use-cases';
import { UserRegistrationInvitationDto } from '@application/dto';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetUserRegistrationInvitationQuery {
  private constructor(public readonly token: string) {}

  static create(token: string) {
    return new GetUserRegistrationInvitationQuery(token);
  }
}

@QueryHandler(GetUserRegistrationInvitationQuery)
export class GetUserRegistrationInvitationHandler
  extends BaseQueryHandler<
    GetUserRegistrationInvitationQuery,
    UserRegistrationInvitationDto
  >
  implements IQueryHandler<GetUserRegistrationInvitationQuery>
{
  constructor(private readonly useCase: GetUserRegistrationInvitationUseCase) {
    super();
  }

  async execute(
    query: GetUserRegistrationInvitationQuery,
  ): Promise<UserRegistrationInvitationDto> {
    return this.run(query, () => this.useCase.execute(query.token));
  }
}
