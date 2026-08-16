import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteExpirationNotificationPolicyDto } from '@application/dto';
import { DeleteExpirationNotificationPolicyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteExpirationNotificationPolicyCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: DeleteExpirationNotificationPolicyDto,
  ) {}

  static create(payload: DeleteExpirationNotificationPolicyDto) {
    return new DeleteExpirationNotificationPolicyCommandAdapter(payload);
  }
}

@CommandHandler(DeleteExpirationNotificationPolicyCommandAdapter)
export class DeleteExpirationNotificationPolicyHandler extends BaseCommandHandler<
  DeleteExpirationNotificationPolicyCommandAdapter,
  void
> {
  constructor(
    private readonly useCase: DeleteExpirationNotificationPolicyUseCase,
  ) {
    super();
  }

  async execute(
    command: DeleteExpirationNotificationPolicyCommandAdapter,
  ): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
