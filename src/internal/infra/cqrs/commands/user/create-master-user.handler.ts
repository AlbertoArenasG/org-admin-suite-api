import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import {
  CreateMasterUserDto,
  CreateMasterUserResultDto,
} from '@application/dto';
import { CreateMasterUserUseCase } from '@application/use-cases';

export class CreateMasterUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateMasterUserDto) {}

  static create(payload: CreateMasterUserDto) {
    return new CreateMasterUserCommandAdapter(payload);
  }
}

@CommandHandler(CreateMasterUserCommandAdapter)
export class CreateMasterUserHandler
  implements ICommandHandler<CreateMasterUserCommandAdapter>
{
  constructor(private readonly useCase: CreateMasterUserUseCase) {}

  async execute(
    command: CreateMasterUserCommandAdapter,
  ): Promise<CreateMasterUserResultDto> {
    return this.useCase.execute(command.payload);
  }
}
