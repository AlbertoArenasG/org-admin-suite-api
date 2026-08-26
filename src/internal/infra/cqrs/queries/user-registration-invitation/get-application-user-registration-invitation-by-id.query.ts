import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApplicationUserRegistrationInvitationDto } from '@application/dto';
import { GetApplicationUserRegistrationInvitationByIdUseCase } from '@application/use-cases';
import { BaseQueryHandler } from '@infra/cqrs/base-query.handler';

export class GetApplicationUserRegistrationInvitationByIdQuery {
  private constructor(public readonly invitationId: string) {}

  static create(invitationId: string) {
    return new GetApplicationUserRegistrationInvitationByIdQuery(invitationId);
  }
}

@QueryHandler(GetApplicationUserRegistrationInvitationByIdQuery)
export class GetApplicationUserRegistrationInvitationByIdHandler
  extends BaseQueryHandler<
    GetApplicationUserRegistrationInvitationByIdQuery,
    ApplicationUserRegistrationInvitationDto
  >
  implements IQueryHandler<GetApplicationUserRegistrationInvitationByIdQuery>
{
  constructor(
    private readonly useCase: GetApplicationUserRegistrationInvitationByIdUseCase,
  ) {
    super();
  }

  async execute(
    query: GetApplicationUserRegistrationInvitationByIdQuery,
  ): Promise<ApplicationUserRegistrationInvitationDto> {
    return this.run(query, () => this.useCase.execute(query.invitationId));
  }
}
