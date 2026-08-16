import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateExpirationNotificationPolicyDto,
  CreateExpirationNotificationPolicyResultDto,
} from '@application/dto';
import { CreateExpirationNotificationPolicyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateExpirationNotificationPolicyCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateExpirationNotificationPolicyDto,
  ) {}

  static create(payload: CreateExpirationNotificationPolicyDto) {
    return new CreateExpirationNotificationPolicyCommandAdapter(payload);
  }
}

@CommandHandler(CreateExpirationNotificationPolicyCommandAdapter)
export class CreateExpirationNotificationPolicyHandler extends BaseCommandHandler<
  CreateExpirationNotificationPolicyCommandAdapter,
  CreateExpirationNotificationPolicyResultDto
> {
  constructor(
    private readonly useCase: CreateExpirationNotificationPolicyUseCase,
  ) {
    super();
  }

  async execute(
    command: CreateExpirationNotificationPolicyCommandAdapter,
  ): Promise<CreateExpirationNotificationPolicyResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
