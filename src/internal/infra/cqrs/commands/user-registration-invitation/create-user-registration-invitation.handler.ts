import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
import { CreateApplicationUserRegistrationInvitationUseCase } from '@application/use-cases';
import {
  CreateApplicationUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { UserRole } from '@domain/entities';

export class CreateUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateApplicationUserRegistrationInvitationDto,
    public readonly actorRole: UserRole,
  ) {}

  static create(
    payload: CreateApplicationUserRegistrationInvitationDto,
    actorRole: UserRole,
  ) {
    return new CreateUserRegistrationInvitationCommandAdapter(
      payload,
      actorRole,
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
      this.useCase.execute(command.payload, command.actorRole),
    );
  }
}
