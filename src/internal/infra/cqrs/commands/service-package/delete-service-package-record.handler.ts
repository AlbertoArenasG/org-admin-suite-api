import { CommandHandler, ICommand } from '@nestjs/cqrs';

import {
  DeleteServicePackageRecordDto,
  ServicePackageRecordViewDto,
} from '@application/dto';
import { DeleteServicePackageRecordUseCase } from '@application/use-cases';
import { BaseCommandHandler } from '@infra/cqrs/base-command.handler';

export class DeleteServicePackageRecordCommandAdapter implements ICommand {
  private constructor(public readonly payload: DeleteServicePackageRecordDto) {}

  static create(payload: DeleteServicePackageRecordDto) {
    return new DeleteServicePackageRecordCommandAdapter(payload);
  }
}

@CommandHandler(DeleteServicePackageRecordCommandAdapter)
export class DeleteServicePackageRecordHandler extends BaseCommandHandler<
  DeleteServicePackageRecordCommandAdapter,
  ServicePackageRecordViewDto
> {
  constructor(private readonly useCase: DeleteServicePackageRecordUseCase) {
    super();
  }

  async execute(
    command: DeleteServicePackageRecordCommandAdapter,
  ): Promise<ServicePackageRecordViewDto> {
    return this.run(command, () => this.useCase.execute(command.payload));
  }
}
