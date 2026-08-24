import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  ApplicationUserRegistrationInvitationDto,
  RevokeApplicationUserRegistrationInvitationDto,
} from '@application/dto';
import { RevokeApplicationUserRegistrationInvitationUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class RevokeApplicationUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: RevokeApplicationUserRegistrationInvitationDto,
  ) {}

  static create(payload: RevokeApplicationUserRegistrationInvitationDto) {
    return new RevokeApplicationUserRegistrationInvitationCommandAdapter(
      payload,
    );
  }
}

@CommandHandler(RevokeApplicationUserRegistrationInvitationCommandAdapter)
export class RevokeApplicationUserRegistrationInvitationHandler extends BaseCommandHandler<
  RevokeApplicationUserRegistrationInvitationCommandAdapter,
  ApplicationUserRegistrationInvitationDto
> {
  constructor(
    private readonly useCase: RevokeApplicationUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: RevokeApplicationUserRegistrationInvitationCommandAdapter,
  ): Promise<ApplicationUserRegistrationInvitationDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
