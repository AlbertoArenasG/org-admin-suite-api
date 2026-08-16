import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  UpdateInternalAssetMaintenanceRecordDto,
  UpdateInternalAssetMaintenanceRecordResultDto,
} from '@application/dto';
import { UpdateInternalAssetMaintenanceRecordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class UpdateInternalAssetMaintenanceRecordCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: UpdateInternalAssetMaintenanceRecordDto,
  ) {}

  static create(payload: UpdateInternalAssetMaintenanceRecordDto) {
    return new UpdateInternalAssetMaintenanceRecordCommandAdapter(payload);
  }
}

@CommandHandler(UpdateInternalAssetMaintenanceRecordCommandAdapter)
export class UpdateInternalAssetMaintenanceRecordHandler extends BaseCommandHandler<
  UpdateInternalAssetMaintenanceRecordCommandAdapter,
  UpdateInternalAssetMaintenanceRecordResultDto
> {
  constructor(
    private readonly useCase: UpdateInternalAssetMaintenanceRecordUseCase,
  ) {
    super();
  }

  async execute(
    command: UpdateInternalAssetMaintenanceRecordCommandAdapter,
  ): Promise<UpdateInternalAssetMaintenanceRecordResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
