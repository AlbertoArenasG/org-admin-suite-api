import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';
import { RespondUserRegistrationInvitationUseCase } from '@application/use-cases';
import {
  RespondUserRegistrationInvitationDto,
  RespondUserRegistrationInvitationResultDto,
} from '@application/dto';

export class RespondUserRegistrationInvitationCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: RespondUserRegistrationInvitationDto,
  ) {}

  static create(payload: RespondUserRegistrationInvitationDto) {
    return new RespondUserRegistrationInvitationCommandAdapter(payload);
  }
}

@CommandHandler(RespondUserRegistrationInvitationCommandAdapter)
export class RespondUserRegistrationInvitationHandler extends BaseCommandHandler<
  RespondUserRegistrationInvitationCommandAdapter,
  RespondUserRegistrationInvitationResultDto
> {
  constructor(
    private readonly useCase: RespondUserRegistrationInvitationUseCase,
  ) {
    super();
  }

  async execute(
    command: RespondUserRegistrationInvitationCommandAdapter,
  ): Promise<RespondUserRegistrationInvitationResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
