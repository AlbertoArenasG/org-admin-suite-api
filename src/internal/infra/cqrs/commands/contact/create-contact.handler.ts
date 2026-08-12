import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { CreateContactDto, CreateContactResultDto } from '@application/dto';
import { CreateContactUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateContactCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateContactDto) {}

  static create(payload: CreateContactDto) {
    return new CreateContactCommandAdapter(payload);
  }
}

@CommandHandler(CreateContactCommandAdapter)
export class CreateContactHandler extends BaseCommandHandler<
  CreateContactCommandAdapter,
  CreateContactResultDto
> {
  constructor(private readonly useCase: CreateContactUseCase) {
    super();
  }

  async execute(
    command: CreateContactCommandAdapter,
  ): Promise<CreateContactResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
