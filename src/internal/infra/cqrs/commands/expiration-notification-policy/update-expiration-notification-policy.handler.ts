import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  UpdateExpirationNotificationPolicyDto,
  UpdateExpirationNotificationPolicyResultDto,
} from '@application/dto';
import { UpdateExpirationNotificationPolicyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateExpirationNotificationPolicyCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateExpirationNotificationPolicyDto,
  ) {}

  static create(payload: UpdateExpirationNotificationPolicyDto) {
    return new UpdateExpirationNotificationPolicyCommandAdapter(payload);
  }
}

@CommandHandler(UpdateExpirationNotificationPolicyCommandAdapter)
export class UpdateExpirationNotificationPolicyHandler extends BaseCommandHandler<
  UpdateExpirationNotificationPolicyCommandAdapter,
  UpdateExpirationNotificationPolicyResultDto
> {
  constructor(
    private readonly useCase: UpdateExpirationNotificationPolicyUseCase,
  ) {
    super();
  }

  async execute(
    command: UpdateExpirationNotificationPolicyCommandAdapter,
  ): Promise<UpdateExpirationNotificationPolicyResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
