import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { RequestPasswordResetDto } from '@application/dto';
import { RequestPasswordResetUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class RequestPasswordResetCommandAdapter implements ICommand {
  private constructor(public readonly payload: RequestPasswordResetDto) {}

  static create(payload: RequestPasswordResetDto) {
    return new RequestPasswordResetCommandAdapter(payload);
  }
}

@CommandHandler(RequestPasswordResetCommandAdapter)
export class RequestPasswordResetHandler extends BaseCommandHandler<
  RequestPasswordResetCommandAdapter,
  void
> {
  constructor(private readonly useCase: RequestPasswordResetUseCase) {
    super();
  }

  async execute(adapter: RequestPasswordResetCommandAdapter): Promise<void> {
    return this.run(adapter, () => this.useCase.execute(adapter.payload));
  }
}
