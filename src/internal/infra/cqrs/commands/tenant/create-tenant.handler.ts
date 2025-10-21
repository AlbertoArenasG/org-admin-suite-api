import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { CreateTenantUseCase } from '@application/use-cases';
import { CreateTenantDto, CreateTenantResultDto } from '@application/dto';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateTenantCommandAdapter implements ICommand {
  private constructor(public readonly payload: CreateTenantDto) {}

  static create(payload: CreateTenantDto) {
    return new CreateTenantCommandAdapter(payload);
  }
}

@CommandHandler(CreateTenantCommandAdapter)
export class CreateTenantHandler extends BaseCommandHandler<
  CreateTenantCommandAdapter,
  CreateTenantResultDto
> {
  constructor(private readonly useCase: CreateTenantUseCase) {
    super();
  }

  async execute(
    command: CreateTenantCommandAdapter,
  ): Promise<CreateTenantResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
