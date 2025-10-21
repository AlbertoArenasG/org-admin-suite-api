import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserAndNotifyUseCase } from '@application/use-cases';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';

export class CreateUserAndNotifyCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateUserDto) {}

  static create(payload: CreateUserDto) {
    return new CreateUserAndNotifyCommandAdapter(payload);
  }
}

@CommandHandler(CreateUserAndNotifyCommandAdapter)
export class CreateUserAndNotifyHandler
  implements ICommandHandler<CreateUserAndNotifyCommandAdapter>
{
  constructor(private readonly useCase: CreateUserAndNotifyUseCase) {}

  async execute(
    command: CreateUserAndNotifyCommandAdapter,
  ): Promise<CreateUserResultDto> {
    return this.useCase.execute(command.payload);
  }
}
