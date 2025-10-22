import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { CreateUserAndNotifyUseCase } from '@application/use-cases';
import { CreateUserDto, CreateUserResultDto } from '@application/dto';
import { UserRole } from '@domain/entities';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateUserAndNotifyCommandAdapter implements ICommand {
  private constructor(
    public readonly payload: CreateUserDto,
    public readonly actorRole: UserRole,
  ) {}

  static create(payload: CreateUserDto, actorRole: UserRole) {
    return new CreateUserAndNotifyCommandAdapter(payload, actorRole);
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
    return this.run(command, () =>
      this.useCase.execute(command.payload, command.actorRole),
    );
  }
}
