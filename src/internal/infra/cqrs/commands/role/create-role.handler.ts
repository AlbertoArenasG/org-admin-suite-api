import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { CreateRoleDto, CreateRoleResultDto } from '@application/dto';
import { CreateRoleUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateRoleCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateRoleDto) {}

  static create(payload: CreateRoleDto) {
    return new CreateRoleCommandAdapter(payload);
  }
}

@CommandHandler(CreateRoleCommandAdapter)
export class CreateRoleHandler extends BaseCommandHandler<
  CreateRoleCommandAdapter,
  CreateRoleResultDto
> {
  constructor(private readonly useCase: CreateRoleUseCase) {
    super();
  }

  async execute(
    command: CreateRoleCommandAdapter,
  ): Promise<CreateRoleResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
