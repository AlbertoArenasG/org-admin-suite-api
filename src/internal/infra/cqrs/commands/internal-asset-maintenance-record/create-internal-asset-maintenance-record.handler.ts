import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  CreateInternalAssetMaintenanceRecordDto,
  CreateInternalAssetMaintenanceRecordResultDto,
} from '@application/dto';
import { CreateInternalAssetMaintenanceRecordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class CreateInternalAssetMaintenanceRecordCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: CreateInternalAssetMaintenanceRecordDto,
  ) {}

  static create(payload: CreateInternalAssetMaintenanceRecordDto) {
    return new CreateInternalAssetMaintenanceRecordCommandAdapter(payload);
  }
}

@CommandHandler(CreateInternalAssetMaintenanceRecordCommandAdapter)
export class CreateInternalAssetMaintenanceRecordHandler extends BaseCommandHandler<
  CreateInternalAssetMaintenanceRecordCommandAdapter,
  CreateInternalAssetMaintenanceRecordResultDto
> {
  constructor(
    private readonly useCase: CreateInternalAssetMaintenanceRecordUseCase,
  ) {
    super();
  }

  async execute(
    command: CreateInternalAssetMaintenanceRecordCommandAdapter,
  ): Promise<CreateInternalAssetMaintenanceRecordResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
