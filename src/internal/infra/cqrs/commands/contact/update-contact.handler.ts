import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UpdateContactDto, UpdateContactResultDto } from '@application/dto';
import { UpdateContactUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateContactCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateContactDto) {}

  static create(payload: UpdateContactDto) {
    return new UpdateContactCommandAdapter(payload);
  }
}

@CommandHandler(UpdateContactCommandAdapter)
export class UpdateContactHandler extends BaseCommandHandler<
  UpdateContactCommandAdapter,
  UpdateContactResultDto
> {
  constructor(private readonly useCase: UpdateContactUseCase) {
    super();
  }

  async execute(
    command: UpdateContactCommandAdapter,
  ): Promise<UpdateContactResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
