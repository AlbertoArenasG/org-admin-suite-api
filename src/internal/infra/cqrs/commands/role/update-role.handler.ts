import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { UpdateRoleDto, UpdateRoleResultDto } from '@application/dto';
import { UpdateRoleUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateRoleCommandAdapter implements ICommand {
  private constructor(public readonly payload: UpdateRoleDto) {}

  static create(payload: UpdateRoleDto) {
    return new UpdateRoleCommandAdapter(payload);
  }
}

@CommandHandler(UpdateRoleCommandAdapter)
export class UpdateRoleHandler extends BaseCommandHandler<
  UpdateRoleCommandAdapter,
  UpdateRoleResultDto
> {
  constructor(private readonly useCase: UpdateRoleUseCase) {
    super();
  }

  async execute(
    command: UpdateRoleCommandAdapter,
  ): Promise<UpdateRoleResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
