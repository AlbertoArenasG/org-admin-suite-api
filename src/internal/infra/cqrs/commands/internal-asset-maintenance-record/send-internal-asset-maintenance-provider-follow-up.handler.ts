import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  SendInternalAssetMaintenanceProviderFollowUpDto,
  SendInternalAssetMaintenanceProviderFollowUpResultDto,
} from '@application/dto';
import { SendInternalAssetMaintenanceProviderFollowUpUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class SendInternalAssetMaintenanceProviderFollowUpCommandAdapter
  implements ICommand
{
  private constructor(
    public readonly payload: SendInternalAssetMaintenanceProviderFollowUpDto,
  ) {}

  static create(payload: SendInternalAssetMaintenanceProviderFollowUpDto) {
    return new SendInternalAssetMaintenanceProviderFollowUpCommandAdapter(
      payload,
    );
  }
}

@CommandHandler(SendInternalAssetMaintenanceProviderFollowUpCommandAdapter)
export class SendInternalAssetMaintenanceProviderFollowUpHandler extends BaseCommandHandler<
  SendInternalAssetMaintenanceProviderFollowUpCommandAdapter,
  SendInternalAssetMaintenanceProviderFollowUpResultDto
> {
  constructor(
    private readonly useCase: SendInternalAssetMaintenanceProviderFollowUpUseCase,
  ) {
    super();
  }

  async execute(
    command: SendInternalAssetMaintenanceProviderFollowUpCommandAdapter,
  ): Promise<SendInternalAssetMaintenanceProviderFollowUpResultDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
