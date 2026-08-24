import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  ApplicationUserRegistrationInvitationDto,
  ResendApplicationUserRegistrationInvitationDto,
} from '@application/dto';
import { ResendApplicationUserRegistrationInvitationUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class ResendApplicationUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: ResendApplicationUserRegistrationInvitationDto,
  ) {}

  static create(payload: ResendApplicationUserRegistrationInvitationDto) {
    return new ResendApplicationUserRegistrationInvitationCommandAdapter(
      payload,
    );
  }
}

@CommandHandler(ResendApplicationUserRegistrationInvitationCommandAdapter)
export class ResendApplicationUserRegistrationInvitationHandler extends BaseCommandHandler<
  ResendApplicationUserRegistrationInvitationCommandAdapter,
  ApplicationUserRegistrationInvitationDto
> {
  constructor(
    private readonly useCase: ResendApplicationUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: ResendApplicationUserRegistrationInvitationCommandAdapter,
  ): Promise<ApplicationUserRegistrationInvitationDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
