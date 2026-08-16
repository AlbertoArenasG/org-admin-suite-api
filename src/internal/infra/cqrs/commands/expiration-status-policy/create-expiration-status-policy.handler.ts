import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateExpirationStatusPolicyDto,
  CreateExpirationStatusPolicyResultDto,
} from '@application/dto';
import { CreateExpirationStatusPolicyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateExpirationStatusPolicyCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: CreateExpirationStatusPolicyDto,
  ) {}

  static create(payload: CreateExpirationStatusPolicyDto) {
    return new CreateExpirationStatusPolicyCommandAdapter(payload);
  }
}

@CommandHandler(CreateExpirationStatusPolicyCommandAdapter)
export class CreateExpirationStatusPolicyHandler extends BaseCommandHandler<
  CreateExpirationStatusPolicyCommandAdapter,
  CreateExpirationStatusPolicyResultDto
> {
  constructor(private readonly useCase: CreateExpirationStatusPolicyUseCase) {
    super();
  }

  async execute(
    command: CreateExpirationStatusPolicyCommandAdapter,
  ): Promise<CreateExpirationStatusPolicyResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
