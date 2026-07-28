import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  ChangeRoleStatusDto,
  ChangeRoleStatusResultDto,
} from '@application/dto';
import { ChangeRoleStatusUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class ChangeRoleStatusCommandAdapter implements ICommand {
  private constructor(public readonly payload: ChangeRoleStatusDto) {}

  static create(payload: ChangeRoleStatusDto) {
    return new ChangeRoleStatusCommandAdapter(payload);
  }
}

@CommandHandler(ChangeRoleStatusCommandAdapter)
export class ChangeRoleStatusHandler extends BaseCommandHandler<
  ChangeRoleStatusCommandAdapter,
  ChangeRoleStatusResultDto
> {
  constructor(private readonly useCase: ChangeRoleStatusUseCase) {
    super();
  }

  async execute(
    command: ChangeRoleStatusCommandAdapter,
  ): Promise<ChangeRoleStatusResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
