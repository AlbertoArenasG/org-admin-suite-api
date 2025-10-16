import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserAndNotifyCommand } from '@application/commands';
import { CreateUserAndNotifyUseCase } from '@application/use-cases';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';

export class CreateUserAndNotifyCmd
  extends CreateUserAndNotifyCommand
  implements ICommand
{
  constructor(public readonly payload: CreateUserDto) {
    super(payload);
  }

  static create(payload: CreateUserDto): CreateUserAndNotifyCmd {
    return new CreateUserAndNotifyCmd(payload);
  }
}

@CommandHandler(CreateUserAndNotifyCmd)
export class CreateUserAndNotifyHandler
  implements ICommandHandler<CreateUserAndNotifyCmd>
{
  constructor(private readonly useCase: CreateUserAndNotifyUseCase) {}

  async execute(command: CreateUserAndNotifyCmd): Promise<CreateUserResultDto> {
    return this.useCase.execute(command.payload);
  }
}
