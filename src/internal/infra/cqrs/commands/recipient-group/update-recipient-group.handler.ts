import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  UpdateRecipientGroupDto,
  UpdateRecipientGroupResultDto,
} from '@application/dto';
import { UpdateRecipientGroupUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateRecipientGroupCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateRecipientGroupDto) {}

  static create(payload: UpdateRecipientGroupDto) {
    return new UpdateRecipientGroupCommandAdapter(payload);
  }
}

@CommandHandler(UpdateRecipientGroupCommandAdapter)
export class UpdateRecipientGroupHandler extends BaseCommandHandler<
  UpdateRecipientGroupCommandAdapter,
  UpdateRecipientGroupResultDto
> {
  constructor(private readonly useCase: UpdateRecipientGroupUseCase) {
    super();
  }

  async execute(
    command: UpdateRecipientGroupCommandAdapter,
  ): Promise<UpdateRecipientGroupResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
