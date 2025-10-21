import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { CreateTenantUseCase } from '@application/use-cases';
import { CreateTenantDto, CreateTenantResultDto } from '@application/dto';

export class CreateTenantCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateTenantDto) {}

  static create(payload: CreateTenantDto) {
    return new CreateTenantCommandAdapter(payload);
  }
}

@CommandHandler(CreateTenantCommandAdapter)
export class CreateTenantHandler
  implements ICommandHandler<CreateTenantCommandAdapter>
{
  constructor(private readonly useCase: CreateTenantUseCase) {}

  async execute(
    command: CreateTenantCommandAdapter,
  ): Promise<CreateTenantResultDto> {
    return this.useCase.execute(command.payload);
  }
}
