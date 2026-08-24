import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GetApplicationUserRegistrationInvitationsDto,
  GetApplicationUserRegistrationInvitationsResultDto,
} from '@application/dto';
import { GetApplicationUserRegistrationInvitationsUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetApplicationUserRegistrationInvitationsQuery {
  private constructor(
    public readonly payload: GetApplicationUserRegistrationInvitationsDto,
  ) {}

  static create(payload: GetApplicationUserRegistrationInvitationsDto) {
    return new GetApplicationUserRegistrationInvitationsQuery(payload);
  }
}

@QueryHandler(GetApplicationUserRegistrationInvitationsQuery)
export class GetApplicationUserRegistrationInvitationsHandler
  extends BaseQueryHandler<
    GetApplicationUserRegistrationInvitationsQuery,
    GetApplicationUserRegistrationInvitationsResultDto
  >
  implements IQueryHandler<GetApplicationUserRegistrationInvitationsQuery>
{
  constructor(
    private readonly useCase: GetApplicationUserRegistrationInvitationsUseCase,
  ) {
    super();
  }

  async execute(
    query: GetApplicationUserRegistrationInvitationsQuery,
  ): Promise<GetApplicationUserRegistrationInvitationsResultDto> {
    return this.run(query, () => this.useCase.execute(query.payload));
  }
}
