import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteExpirationStatusPolicyDto } from '@application/dto';
import { DeleteExpirationStatusPolicyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteExpirationStatusPolicyCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: DeleteExpirationStatusPolicyDto,
  ) {}

  static create(payload: DeleteExpirationStatusPolicyDto) {
    return new DeleteExpirationStatusPolicyCommandAdapter(payload);
  }
}

@CommandHandler(DeleteExpirationStatusPolicyCommandAdapter)
export class DeleteExpirationStatusPolicyHandler extends BaseCommandHandler<
  DeleteExpirationStatusPolicyCommandAdapter,
  void
> {
  constructor(private readonly useCase: DeleteExpirationStatusPolicyUseCase) {
    super();
  }

  async execute(command: DeleteExpirationStatusPolicyCommandAdapter) {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
