import { CommandHandler, ICommand } from '@nestjs/cqrs';

import { DeleteInternalAssetMaintenanceRecordDto } from '@application/dto';
import { DeleteInternalAssetMaintenanceRecordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteInternalAssetMaintenanceRecordCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: DeleteInternalAssetMaintenanceRecordDto,
  ) {}

  static create(payload: DeleteInternalAssetMaintenanceRecordDto) {
    return new DeleteInternalAssetMaintenanceRecordCommandAdapter(payload);
  }
}

@CommandHandler(DeleteInternalAssetMaintenanceRecordCommandAdapter)
export class DeleteInternalAssetMaintenanceRecordHandler extends BaseCommandHandler<
  DeleteInternalAssetMaintenanceRecordCommandAdapter,
  void
> {
  constructor(
    private readonly useCase: DeleteInternalAssetMaintenanceRecordUseCase,
  ) {
    super();
  }

  async execute(
    command: DeleteInternalAssetMaintenanceRecordCommandAdapter,
  ): Promise<void> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
