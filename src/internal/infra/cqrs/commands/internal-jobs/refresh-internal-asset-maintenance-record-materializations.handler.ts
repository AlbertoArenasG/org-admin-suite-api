import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  RefreshInternalAssetMaintenanceRecordMaterializationsDto,
  RefreshInternalAssetMaintenanceRecordMaterializationsResultDto,
} from '@application/dto';
import { RefreshInternalAssetMaintenanceRecordMaterializationsUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: RefreshInternalAssetMaintenanceRecordMaterializationsDto,
  ) {}

  static create(
    payload: RefreshInternalAssetMaintenanceRecordMaterializationsDto,
  ) {
    return new RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter(
      payload,
    );
  }
}

@CommandHandler(
  RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter,
)
export class RefreshInternalAssetMaintenanceRecordMaterializationsHandler extends BaseCommandHandler<
  RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter,
  RefreshInternalAssetMaintenanceRecordMaterializationsResultDto
> {
  constructor(
    private readonly useCase: RefreshInternalAssetMaintenanceRecordMaterializationsUseCase,
  ) {
    super();
  }

  async execute(
    command: RefreshInternalAssetMaintenanceRecordMaterializationsCommandAdapter,
  ): Promise<RefreshInternalAssetMaintenanceRecordMaterializationsResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
