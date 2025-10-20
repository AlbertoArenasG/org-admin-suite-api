import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { CreateMasterUserCommand } from '@application/commands';
import {
  CreateMasterUserDto,
  CreateMasterUserResultDto,
} from '@application/dto';
import { CreateMasterUserUseCase } from '@application/use-cases';

export class CreateMasterUserCmd
  extends CreateMasterUserCommand
  implements ICommand
{
  constructor(public readonly payload: CreateMasterUserDto) {
    super(payload);
  }

  static create(payload: CreateMasterUserDto): CreateMasterUserCmd {
    return new CreateMasterUserCmd(payload);
  }
}

@CommandHandler(CreateMasterUserCmd)
export class CreateMasterUserHandler
  implements ICommandHandler<CreateMasterUserCmd>
{
  constructor(private readonly useCase: CreateMasterUserUseCase) {}

  async execute(
    command: CreateMasterUserCmd,
  ): Promise<CreateMasterUserResultDto> {
    return this.useCase.execute(command.payload);
  }
}
