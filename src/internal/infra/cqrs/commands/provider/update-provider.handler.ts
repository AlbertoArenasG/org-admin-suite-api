import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UpdateProviderDto, ProviderViewDto } from '@application/dto';
import { UpdateProviderUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateProviderCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateProviderDto) {}

  static create(payload: UpdateProviderDto) {
    return new UpdateProviderCommandAdapter(payload);
  }
}

@CommandHandler(UpdateProviderCommandAdapter)
export class UpdateProviderHandler extends BaseCommandHandler<
  UpdateProviderCommandAdapter,
  ProviderViewDto
> {
  constructor(private readonly useCase: UpdateProviderUseCase) {
    super();
  }

  async execute(
    command: UpdateProviderCommandAdapter,
  ): Promise<ProviderViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
