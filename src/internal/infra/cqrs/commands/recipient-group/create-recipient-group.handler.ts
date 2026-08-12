import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateRecipientGroupDto,
  CreateRecipientGroupResultDto,
} from '@application/dto';
import { CreateRecipientGroupUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateRecipientGroupCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateRecipientGroupDto) {}

  static create(payload: CreateRecipientGroupDto) {
    return new CreateRecipientGroupCommandAdapter(payload);
  }
}

@CommandHandler(CreateRecipientGroupCommandAdapter)
export class CreateRecipientGroupHandler extends BaseCommandHandler<
  CreateRecipientGroupCommandAdapter,
  CreateRecipientGroupResultDto
> {
  constructor(private readonly useCase: CreateRecipientGroupUseCase) {
    super();
  }

  async execute(
    command: CreateRecipientGroupCommandAdapter,
  ): Promise<CreateRecipientGroupResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
