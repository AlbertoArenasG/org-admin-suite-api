import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
import { CreateTenantUserRegistrationInvitationUseCase } from '@application/use-cases';
import {
  CreateTenantUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';

export class CreateTenantUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateTenantUserRegistrationInvitationDto,
  ) {}

  static create(payload: CreateTenantUserRegistrationInvitationDto) {
    return new CreateTenantUserRegistrationInvitationCommandAdapter(payload);
  }
}

@CommandHandler(CreateTenantUserRegistrationInvitationCommandAdapter)
export class CreateTenantUserRegistrationInvitationHandler extends BaseCommandHandler<
  CreateTenantUserRegistrationInvitationCommandAdapter,
  UserRegistrationInvitationDto
> {
  constructor(
    private readonly useCase: CreateTenantUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: CreateTenantUserRegistrationInvitationCommandAdapter,
  ): Promise<UserRegistrationInvitationDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
