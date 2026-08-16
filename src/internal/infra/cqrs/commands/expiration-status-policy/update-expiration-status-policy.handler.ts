import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  UpdateExpirationStatusPolicyDto,
  UpdateExpirationStatusPolicyResultDto,
} from '@application/dto';
import { UpdateExpirationStatusPolicyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateExpirationStatusPolicyCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: UpdateExpirationStatusPolicyDto,
  ) {}

  static create(payload: UpdateExpirationStatusPolicyDto) {
    return new UpdateExpirationStatusPolicyCommandAdapter(payload);
  }
}

@CommandHandler(UpdateExpirationStatusPolicyCommandAdapter)
export class UpdateExpirationStatusPolicyHandler extends BaseCommandHandler<
  UpdateExpirationStatusPolicyCommandAdapter,
  UpdateExpirationStatusPolicyResultDto
> {
  constructor(private readonly useCase: UpdateExpirationStatusPolicyUseCase) {
    super();
  }

  async execute(
    command: UpdateExpirationStatusPolicyCommandAdapter,
  ): Promise<UpdateExpirationStatusPolicyResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
