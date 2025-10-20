import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { CreateTenantCommand } from '@application/commands';
import { CreateTenantUseCase } from '@application/use-cases';
import { CreateTenantDto, CreateTenantResultDto } from '@application/dto';

export class CreateTenantCmd extends CreateTenantCommand implements ICommand {
  constructor(public readonly payload: CreateTenantDto) {
    super(payload);
  }

  static create(payload: CreateTenantDto): CreateTenantCmd {
    return new CreateTenantCmd(payload);
  }
}

@CommandHandler(CreateTenantCmd)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCmd> {
  constructor(private readonly useCase: CreateTenantUseCase) {}

  async execute(command: CreateTenantCmd): Promise<CreateTenantResultDto> {
    return this.useCase.execute(command.payload);
  }
}
