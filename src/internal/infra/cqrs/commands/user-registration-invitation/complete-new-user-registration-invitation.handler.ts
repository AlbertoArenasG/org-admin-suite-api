import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
import { CompleteNewUserRegistrationInvitationUseCase } from '@application/use-cases';
import {
  CompleteNewUserRegistrationInvitationDto,
  CompleteNewUserRegistrationInvitationResultDto,
} from '@application/dto';

export class CompleteNewUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CompleteNewUserRegistrationInvitationDto,
  ) {}

  static create(payload: CompleteNewUserRegistrationInvitationDto) {
    return new CompleteNewUserRegistrationInvitationCommandAdapter(payload);
  }
}

@CommandHandler(CompleteNewUserRegistrationInvitationCommandAdapter)
export class CompleteNewUserRegistrationInvitationHandler extends BaseCommandHandler<
  CompleteNewUserRegistrationInvitationCommandAdapter,
  CompleteNewUserRegistrationInvitationResultDto
> {
  constructor(
    private readonly useCase: CompleteNewUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: CompleteNewUserRegistrationInvitationCommandAdapter,
  ): Promise<CompleteNewUserRegistrationInvitationResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
