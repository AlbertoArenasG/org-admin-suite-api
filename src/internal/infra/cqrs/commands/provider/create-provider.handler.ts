import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { CreateProviderDto, CreateProviderResultDto } from '@application/dto';
import { CreateProviderUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateProviderCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateProviderDto) {}

  static create(payload: CreateProviderDto) {
    return new CreateProviderCommandAdapter(payload);
  }
}

@CommandHandler(CreateProviderCommandAdapter)
export class CreateProviderHandler extends BaseCommandHandler<
  CreateProviderCommandAdapter,
  CreateProviderResultDto
> {
  constructor(private readonly useCase: CreateProviderUseCase) {
    super();
  }

  async execute(
    command: CreateProviderCommandAdapter,
  ): Promise<CreateProviderResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
