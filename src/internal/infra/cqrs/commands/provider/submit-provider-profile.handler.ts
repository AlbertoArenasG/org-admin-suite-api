import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { SubmitProviderProfileDto, ProviderViewDto } from '@application/dto';
import { SubmitProviderProfileUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class SubmitProviderProfileCommandAdapter implements ICommand {
  private constructor(public readonly payload: SubmitProviderProfileDto) {}

  static create(payload: SubmitProviderProfileDto) {
    return new SubmitProviderProfileCommandAdapter(payload);
  }
}

@CommandHandler(SubmitProviderProfileCommandAdapter)
export class SubmitProviderProfileHandler extends BaseCommandHandler<
  SubmitProviderProfileCommandAdapter,
  ProviderViewDto
> {
  constructor(private readonly useCase: SubmitProviderProfileUseCase) {
    super();
  }

  async execute(
    command: SubmitProviderProfileCommandAdapter,
  ): Promise<ProviderViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
