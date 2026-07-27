import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
import { CreateApplicationUserRegistrationInvitationUseCase } from '@application/use-cases';
import {
  CreateApplicationUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { SystemRole } from '@domain/entities';

export class CreateUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateApplicationUserRegistrationInvitationDto,
    public readonly actorSystemRole: SystemRole,
  ) {}

  static create(
    payload: CreateApplicationUserRegistrationInvitationDto,
    actorSystemRole: SystemRole,
  ) {
    return new CreateUserRegistrationInvitationCommandAdapter(
      payload,
      actorSystemRole,
    );
  }
}

@CommandHandler(CreateUserRegistrationInvitationCommandAdapter)
export class CreateUserRegistrationInvitationHandler extends BaseCommandHandler<
  CreateUserRegistrationInvitationCommandAdapter,
  UserRegistrationInvitationDto
> {
  constructor(
    private readonly useCase: CreateApplicationUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: CreateUserRegistrationInvitationCommandAdapter,
  ): Promise<UserRegistrationInvitationDto> {
    return this.run(command, () =>
      this.useCase.execute(command.payload, command.actorSystemRole),
    );
  }
}
