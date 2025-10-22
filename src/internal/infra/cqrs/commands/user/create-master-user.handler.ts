import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateMasterUserDto,
  CreateMasterUserResultDto,
} from '@application/dto';
import { UserRole } from '@domain/entities';
import { CreateMasterUserAndNotifyUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateMasterUserCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: CreateMasterUserDto,
    public readonly actorRole: UserRole,
  ) {}

  static create(payload: CreateMasterUserDto, actorRole: UserRole) {
    return new CreateMasterUserCommandAdapter(payload, actorRole);
  }
}

@CommandHandler(CreateMasterUserCommandAdapter)
export class CreateMasterUserHandler extends BaseCommandHandler<
  CreateMasterUserCommandAdapter,
  CreateMasterUserResultDto
> {
  constructor(private readonly useCase: CreateMasterUserAndNotifyUseCase) {
    super();
  }

  async execute(
    command: CreateMasterUserCommandAdapter,
  ): Promise<CreateMasterUserResultDto> {
    return this.run(command, () =>
      this.useCase.execute(command.payload, command.actorRole),
    );
  }
}
