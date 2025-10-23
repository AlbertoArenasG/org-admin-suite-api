import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UpdateUserDto, UpdateUserResultDto } from '@application/dto';
import { UpdateUserUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateUserDto) {}

  static create(payload: UpdateUserDto) {
    return new UpdateUserCommandAdapter(payload);
  }
}

@CommandHandler(UpdateUserCommandAdapter)
export class UpdateUserHandler extends BaseCommandHandler<
  UpdateUserCommandAdapter,
  UpdateUserResultDto
> {
  constructor(private readonly useCase: UpdateUserUseCase) {
    super();
  }

  async execute(
    command: UpdateUserCommandAdapter,
  ): Promise<UpdateUserResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
