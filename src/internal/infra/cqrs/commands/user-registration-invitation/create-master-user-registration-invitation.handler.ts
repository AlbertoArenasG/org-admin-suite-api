import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
import { CreateMasterUserRegistrationInvitationUseCase } from '@application/use-cases';
import {
  CreateMasterUserRegistrationInvitationDto,
  UserRegistrationInvitationDto,
} from '@application/dto';
import { SystemRole } from '@domain/entities';

export class CreateMasterUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateMasterUserRegistrationInvitationDto,
    public readonly actorSystemRole: SystemRole,
  ) {}

  static create(
    payload: CreateMasterUserRegistrationInvitationDto,
    actorSystemRole: SystemRole,
  ) {
    return new CreateMasterUserRegistrationInvitationCommandAdapter(
      payload,
      actorSystemRole,
    );
  }
}

@CommandHandler(CreateMasterUserRegistrationInvitationCommandAdapter)
export class CreateMasterUserRegistrationInvitationHandler extends BaseCommandHandler<
  CreateMasterUserRegistrationInvitationCommandAdapter,
  UserRegistrationInvitationDto
> {
  constructor(
    private readonly useCase: CreateMasterUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: CreateMasterUserRegistrationInvitationCommandAdapter,
  ): Promise<UserRegistrationInvitationDto> {
    return this.run(command, () =>
      this.useCase.execute(command.payload, command.actorSystemRole),
    );
  }
}
