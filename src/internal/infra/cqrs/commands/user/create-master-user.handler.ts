import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateMasterUserDto,
  CreateMasterUserResultDto,
} from '@application/dto';
import { CreateMasterUserUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateMasterUserCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateMasterUserDto) {}

  static create(payload: CreateMasterUserDto) {
    return new CreateMasterUserCommandAdapter(payload);
  }
}

@CommandHandler(CreateMasterUserCommandAdapter)
export class CreateMasterUserHandler extends BaseCommandHandler<
  CreateMasterUserCommandAdapter,
  CreateMasterUserResultDto
> {
  constructor(private readonly useCase: CreateMasterUserUseCase) {
    super();
  }

  async execute(
    command: CreateMasterUserCommandAdapter,
  ): Promise<CreateMasterUserResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
