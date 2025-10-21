import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { CreateUserAndNotifyUseCase } from '@application/use-cases';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateUserAndNotifyCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateUserDto) {}

  static create(payload: CreateUserDto) {
    return new CreateUserAndNotifyCommandAdapter(payload);
  }
}

@CommandHandler(CreateUserAndNotifyCommandAdapter)
export class CreateUserAndNotifyHandler extends BaseCommandHandler<
  CreateUserAndNotifyCommandAdapter,
  CreateUserResultDto
> {
  constructor(private readonly useCase: CreateUserAndNotifyUseCase) {
    super();
  }

  async execute(
    command: CreateUserAndNotifyCommandAdapter,
  ): Promise<CreateUserResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
